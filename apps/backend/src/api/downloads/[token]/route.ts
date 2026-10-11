import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"
import { DIGITAL_PRODUCT_MODULE } from "../../../modules/digital-product"
import DigitalProductModuleService from "../../../modules/digital-product/service"
import { MediaType } from "../../../modules/digital-product/types"
import { verifyDownloadToken } from "../../../modules/digital-product/lib/download-token"

/**
 * Streams a purchased file. The token in the URL is signed and expiring, and
 * names one purchase and one file, so the file's storage location is never
 * exposed and a link can't be edited to reach another file.
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const payload = verifyDownloadToken(req.params.token)
  if (!payload) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "This download link is invalid or has expired."
    )
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const {
    data: [digitalProductOrder],
  } = await query.graph({
    entity: "digital_product_order",
    fields: ["id", "order.status", "products.medias.*"],
    filters: { id: payload.dpo },
  })

  const media = digitalProductOrder?.products
    ?.flatMap((product) => product?.medias ?? [])
    .find((m) => m?.id === payload.media && m?.type === MediaType.MAIN)

  if (!media || digitalProductOrder.order?.status === "canceled") {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "This download link is invalid or has expired."
    )
  }

  const fileModuleService = req.scope.resolve(Modules.FILE)
  const stream = await fileModuleService.getDownloadStream(media.fileId)

  const digitalProductModuleService: DigitalProductModuleService =
    req.scope.resolve(DIGITAL_PRODUCT_MODULE)
  await digitalProductModuleService.createDigitalProductDownloads({
    media_id: media.id,
    digital_product_order_id: digitalProductOrder.id,
    version: media.version,
  })

  const filename = (media.filename || "download").replace(/[^\w.\- ]/g, "_")
  res.setHeader("Content-Type", media.mimeType || "application/octet-stream")
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`)
  res.setHeader("Cache-Control", "private, no-store")

  stream.on("error", () => res.destroy())
  stream.pipe(res)
}
