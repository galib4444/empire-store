"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"

export async function newsletterPreference() {
  return sdk.client.fetch<{ opted_in: boolean }>("/store/customers/me/newsletter", { headers: await getAuthHeaders(), cache: "no-store" })
}

export async function saveNewsletterPreference(opted_in: boolean) {
  return sdk.client.fetch<{ opted_in: boolean }>("/store/customers/me/newsletter", { method: "POST", headers: await getAuthHeaders(), body: { opted_in }, cache: "no-store" })
}
