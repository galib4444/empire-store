/**
 * Loads the active brand's catalog (`brand/<name>/brand.json`) into the store:
 * collections, products, images and the files buyers download.
 *
 *   pnpm exec medusa exec ./src/scripts/seed-brand.ts
 *
 * Safe to re-run: a product whose handle already exists is skipped.
 */
import fs from "fs"
import path from "path"
import type { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createCollectionsWorkflow,
  createProductsWorkflow,
  uploadFilesWorkflow,
} from "@medusajs/medusa/core-flows"
import { brandAssetsDir, loadBrand, readDescription } from "../lib/brand"
import { DIGITAL_PRODUCT_MODULE } from "../modules/digital-product"
import DigitalProductModuleService from "../modules/digital-product/service"
import { MediaType } from "../modules/digital-product/types"

const MIME_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".zip": "application/zip",
  ".epub": "application/epub+zip",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
}

function mimeType(file: string): string {
  return MIME_TYPES[path.extname(file).toLowerCase()] || "application/octet-stream"
}

export default async function seedBrand({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const digitalProductModuleService: DigitalProductModuleService =
    container.resolve(DIGITAL_PRODUCT_MODULE)

  const brand = loadBrand()
  const assetsDir = brandAssetsDir()

  const upload = async (relativePaths: string[], access: "public" | "private") => {
    if (!relativePaths.length) {
      return []
    }
    const { result } = await uploadFilesWorkflow(container).run({
      input: {
        files: relativePaths.map((relativePath) => ({
          filename: path.basename(relativePath),
          mimeType: mimeType(relativePath),
          content: fs
            .readFileSync(path.join(assetsDir, relativePath))
            .toString("base64"),
          access,
        })),
      },
    })
    return result
  }

  const {
    data: [salesChannel],
  } = await query.graph({ entity: "sales_channel", fields: ["id"] })

  const collectionIds = new Map<string, string>()
  for (const collection of brand.collections ?? []) {
    const {
      data: [existing],
    } = await query.graph({
      entity: "product_collection",
      fields: ["id"],
      filters: { handle: collection.handle },
    })
    if (existing) {
      collectionIds.set(collection.handle, existing.id)
      continue
    }
    const {
      result: [created],
    } = await createCollectionsWorkflow(container).run({
      input: { collections: [collection] },
    })
    collectionIds.set(collection.handle, created.id)
  }

  for (const item of brand.catalog) {
    const { data: existing } = await query.graph({
      entity: "product",
      fields: ["id"],
      filters: { handle: item.handle },
    })
    if (existing.length) {
      logger.info(`Skipping ${item.title}: already in the store.`)
      continue
    }

    const missing = [...item.files, ...item.images].filter(
      (file) => !fs.existsSync(path.join(assetsDir, file))
    )
    if (missing.length) {
      logger.warn(`Skipping ${item.title}: missing ${missing.join(", ")}`)
      continue
    }

    const images = await upload(item.images, "public")
    const files = await upload(item.files, "private")

    // No shipping profile: a digital product needs no delivery step at checkout.
    const {
      result: [product],
    } = await createProductsWorkflow(container).run({
      input: {
        products: [
          {
            title: item.title,
            subtitle: item.subtitle,
            handle: item.handle,
            description: readDescription(item),
            status:
              item.status === "published"
                ? ProductStatus.PUBLISHED
                : ProductStatus.DRAFT,
            collection_id: item.collection
              ? collectionIds.get(item.collection)
              : undefined,
            thumbnail: images[0]?.url,
            images: images.map((image) => ({ url: image.url })),
            metadata: item.metadata,
            options: [{ title: "Format", values: ["Digital download"] }],
            variants: [
              {
                title: "Digital download",
                options: { Format: "Digital download" },
                manage_inventory: false,
                prices: [
                  { currency_code: brand.store.currency, amount: item.price },
                ],
              },
            ],
            sales_channels: [{ id: salesChannel.id }],
          },
        ],
      },
    })

    const digitalProduct =
      await digitalProductModuleService.createDigitalProducts({
        name: item.title,
      })

    await digitalProductModuleService.createDigitalProductMedias(
      files.map((file, index) => ({
        type: MediaType.MAIN,
        fileId: file.id,
        mimeType: mimeType(item.files[index]),
        filename: path.basename(item.files[index]),
        digital_product_id: digitalProduct.id,
      }))
    )

    await link.create({
      [DIGITAL_PRODUCT_MODULE]: { digital_product_id: digitalProduct.id },
      [Modules.PRODUCT]: { product_variant_id: product.variants[0].id },
    })

    logger.info(
      `Added ${item.title} (${item.status}, ${files.length} file${files.length === 1 ? "" : "s"}).`
    )
  }

  // The product search index is filled when the server next starts.
}
