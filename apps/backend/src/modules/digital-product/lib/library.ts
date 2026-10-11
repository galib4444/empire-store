import { MediaType } from "../types"
import {
  createDownloadToken,
  downloadUrl,
  PAGE_LINK_TTL_SECONDS,
} from "./download-token"

type OwnedOrder = {
  id: string
  products?: (
    | {
        id: string
        name: string
        medias?: (
          | {
              id: string
              type: string
              filename: string | null
              version: number
              mimeType: string
            }
          | null
          | undefined
        )[]
      }
    | null
    | undefined
  )[]
}

export type LibraryItem = {
  id: string
  name: string
  files: {
    id: string
    filename: string | null
    version: number
    mime_type: string
    download_url: string
  }[]
}

/**
 * Turns digital product orders into a list of owned products with fresh,
 * short-lived download links. File storage keys are never included.
 */
export function buildLibrary(orders: (OwnedOrder | null | undefined)[]): LibraryItem[] {
  const library = new Map<string, LibraryItem>()

  for (const order of orders) {
    for (const product of order?.products ?? []) {
      if (!product || library.has(product.id)) {
        continue
      }
      library.set(product.id, {
        id: product.id,
        name: product.name,
        files: (product.medias ?? [])
          .filter((media) => media?.type === MediaType.MAIN)
          .map((media) => ({
            id: media!.id,
            filename: media!.filename,
            version: media!.version,
            mime_type: media!.mimeType,
            download_url: downloadUrl(
              createDownloadToken(
                { dpo: order!.id, media: media!.id },
                PAGE_LINK_TTL_SECONDS
              )
            ),
          })),
      })
    }
  }

  return Array.from(library.values())
}
