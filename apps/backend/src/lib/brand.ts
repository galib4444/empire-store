import fs from "fs"
import path from "path"

export type BrandCatalogItem = {
  handle: string
  title: string
  subtitle?: string
  description?: string
  /** Pull the description from the first code block under a heading in a Markdown file. */
  descriptionFrom?: { file: string; heading: string }
  price: number
  status: "published" | "draft"
  collection?: string
  /** Files the buyer receives. Paths are relative to BRAND_ASSETS_DIR. */
  files: string[]
  /** Product images, first one is the thumbnail. Paths are relative to BRAND_ASSETS_DIR. */
  images: string[]
  metadata?: Record<string, unknown>
}

export type Brand = {
  name: string
  tagline: string
  contactEmail: string
  store: { currency: string; regionName: string; countries: string[] }
  collections?: { handle: string; title: string }[]
  catalog: BrandCatalogItem[]
}

/** The `brand/` folder at the repository root. */
export function brandRoot(): string {
  return process.env.BRAND_DIR || path.resolve(process.cwd(), "../../brand")
}

/** The active brand's folder name: `BRAND` env, else the `brand/.active` file. */
export function activeBrandName(): string {
  if (process.env.BRAND) {
    return process.env.BRAND
  }
  return fs.readFileSync(path.join(brandRoot(), ".active"), "utf8").trim()
}

export function loadBrand(): Brand {
  const file = path.join(brandRoot(), activeBrandName(), "brand.json")
  return JSON.parse(fs.readFileSync(file, "utf8")) as Brand
}

/**
 * Where product files and images live. They stay outside the repository so
 * the things being sold are never committed.
 */
export function brandAssetsDir(): string {
  const dir = process.env.BRAND_ASSETS_DIR
  if (!dir) {
    throw new Error("Set BRAND_ASSETS_DIR to the folder holding product files.")
  }
  return dir
}

export function readDescription(item: BrandCatalogItem): string | undefined {
  if (item.description) {
    return item.description
  }
  if (!item.descriptionFrom) {
    return undefined
  }
  const source = fs.readFileSync(
    path.join(brandAssetsDir(), item.descriptionFrom.file),
    "utf8"
  )
  const start = source.indexOf(item.descriptionFrom.heading)
  if (start === -1) {
    return undefined
  }
  const block = source.slice(start).match(/```[^\n]*\n([\s\S]*?)```/)
  return block ? block[1].trim() : undefined
}
