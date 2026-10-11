"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"

export type DigitalProductFile = {
  id: string
  filename: string | null
  version: number
  mime_type: string
  download_url: string
}

export type OwnedDigitalProduct = {
  id: string
  name: string
  files: DigitalProductFile[]
}

type Response = { digital_products: OwnedDigitalProduct[] }

// Download links expire, so neither request is cached.

/** Everything the signed-in customer owns. */
export const listLibrary = async (): Promise<OwnedDigitalProduct[]> => {
  const headers = { ...(await getAuthHeaders()) }

  return sdk.client
    .fetch<Response>(`/store/customers/me/digital-products`, {
      method: "GET",
      headers,
      cache: "no-store",
    })
    .then(({ digital_products }) => digital_products)
    .catch(() => [])
}

/** The downloads that belong to one order. Works for guests. */
export const listOrderDownloads = async (
  orderId: string
): Promise<OwnedDigitalProduct[]> => {
  return sdk.client
    .fetch<Response>(`/store/orders/${orderId}/digital-downloads`, {
      method: "GET",
      cache: "no-store",
    })
    .then(({ digital_products }) => digital_products)
    .catch(() => [])
}
