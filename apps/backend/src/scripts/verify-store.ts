import assert from "node:assert/strict"
import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, generateJwtToken, Modules } from "@medusajs/framework/utils"
import { deleteCampaignsWorkflow, deletePromotionsWorkflow } from "@medusajs/medusa/core-flows"
import seedPromotions from "./seed-promotions"

/** Exercises the running local APIs using manual payments. Never runs in production. */
export default async function verifyStore({ container }: ExecArgs) {
  const base = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
  assert(process.env.NODE_ENV !== "production" && /^http:\/\/(localhost|127\.0\.0\.1):/.test(base), "Verification requires a local development store")
  assert(!process.env.STRIPE_API_KEY && !process.env.RESEND_API_KEY, "Verification must use manual payments and console email")
  const users = container.resolve(Modules.USER)
  const [user] = await users.listUsers({})
  const [key] = await container.resolve(Modules.API_KEY).listApiKeys({ type: "publishable" })
  assert(user && key, "Seed the store and create an admin before verification")
  const token = generateJwtToken({ actor_id: user.id, actor_type: "user", auth_identity_id: "local-verification" }, { secret: process.env.JWT_SECRET!, expiresIn: "10m" })
  const storeHeaders = { "x-publishable-api-key": key.token }
  const adminHeaders = { Authorization: `Bearer ${token}` }
  const request = async (url: string, body?: unknown, admin = false) => {
    const response = await fetch(`${base}${url}`, { method: body === undefined ? "GET" : "POST", headers: { "Content-Type": "application/json", ...(admin ? adminHeaders : storeHeaders) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) })
    const data = await response.json() as any
    assert(response.ok, `${url} failed: HTTP ${response.status} (${data.message || "no detail"})`)
    return data
  }
  assert.equal((await fetch(`${base}/admin/store-overview`)).status, 401)
  assert.equal((await fetch(`${base}/admin/customers/unknown/crm`)).status, 401)
  const overview = await request("/admin/store-overview", undefined, true)
  assert.equal(overview.integrations.email, "console")
  console.log("ok: admin routes require authentication; overview loads")

  const { regions } = await request("/store/regions")
  const region = regions.find((region: any) => region.payment_providers?.some((provider: any) => provider.id === "pp_system_default")) || regions[0]
  const { products } = await request(`/store/products?region_id=${region.id}`)
  const product = products.find((product: any) => product.variants?.some((variant: any) => !variant.manage_inventory))
  assert(product, "The local store must have a published digital product")
  const email = `store-verification-${Date.now()}@example.com`
  const address = { first_name: "Store", last_name: "Verification", address_1: "1 Test Street", city: "New York", country_code: "us", postal_code: "10001", province: "NY" }
  const { cart } = await request("/store/carts", { region_id: region.id, email, items: [{ variant_id: product.variants[0].id, quantity: 1 }], billing_address: address, shipping_address: address })
  const { payment_collection } = await request("/store/payment-collections", { cart_id: cart.id })
  await request(`/store/payment-collections/${payment_collection.id}/payment-sessions`, { provider_id: "pp_system_default" })
  const completed = await request(`/store/carts/${cart.id}/complete`, {})
  assert.equal(completed.type, "order")
  const orderId = completed.order.id
  assert.deepEqual((await request(`/store/orders/${orderId}/digital-downloads`)).digital_products, [])
  console.log("ok: checkout completes without shipping; authorization alone cannot download")

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: [order] } = await query.graph({ entity: "order", fields: ["id", "customer_id", "payment_collections.payments.id"], filters: { id: orderId } })
  const paymentId = order.payment_collections?.[0]?.payments?.[0]?.id
  assert(paymentId, "Checkout must create a payment")
  await request(`/admin/payments/${paymentId}/capture`, {}, true)
  let downloads: any[] = []
  for (let attempt = 0; attempt < 30; attempt++) {
    downloads = (await request(`/store/orders/${orderId}/digital-downloads`)).digital_products
    const delivery = await request(`/admin/orders/${orderId}/digital-delivery`, undefined, true)
    if (downloads.length && delivery.digital_delivery?.status === "sent") break
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  assert(downloads[0]?.files[0]?.download_url, "Captured payment must release a download")
  const file = await fetch(downloads[0].files[0].download_url)
  assert.equal(file.status, 200)
  assert((await file.arrayBuffer()).byteLength > 100)
  const { data: [fulfilled] } = await query.graph({ entity: "order", fields: ["fulfillments.delivered_at", "items.detail.fulfilled_quantity"], filters: { id: orderId } })
  assert(fulfilled.fulfillments?.some((fulfillment: any) => fulfillment.delivered_at), "Digital order must be delivered in the admin")
  console.log("ok: captured order gets private PDF and delivered fulfillment")

  const crm = await request(`/admin/customers/${order.customer_id}/crm`, { tags: ["Verification"], note: "Local verification note" }, true)
  assert.equal(crm.crm.notes.length, 1)
  const changed = await request(`/admin/customers/${order.customer_id}/crm`, { tags: ["Returning"] }, true)
  assert.equal(changed.crm.notes.length, 1)
  const read = await request(`/admin/customers/${order.customer_id}/crm`, undefined, true)
  assert.equal(read.orders.length, 1)
  assert(Object.values(read.lifetime_spend).some((value) => Number(value) > 0))
  console.log("ok: private CRM notes persist; customer timeline and lifetime spend load")

  assert.equal((await fetch(`${base}/store/customers/me/newsletter`, { headers: storeHeaders })).status, 401)
  const customerToken = generateJwtToken({ actor_id: order.customer_id, actor_type: "customer", auth_identity_id: "local-verification" }, { secret: process.env.JWT_SECRET!, expiresIn: "10m" })
  const customerRequest = async (url: string, body?: unknown) => {
    const response = await fetch(`${base}${url}`, { method: body === undefined ? "GET" : "POST", headers: { ...storeHeaders, Authorization: `Bearer ${customerToken}`, "Content-Type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) })
    const data = await response.json() as any
    assert(response.ok, `Customer request ${url} failed: ${response.status} (${data.message || "no detail"})`)
    return data
  }
  assert.deepEqual(await customerRequest("/store/customers/me/newsletter"), { opted_in: false })
  assert.deepEqual(await customerRequest("/store/customers/me/newsletter", { opted_in: true }), { opted_in: true })
  const consent = await request(`/admin/customers/${order.customer_id}/crm`, undefined, true)
  assert(consent.crm.consent_at && consent.crm.newsletter_opt_in)
  assert.equal(consent.crm.notes.length, 1)
  const publicCustomer = await customerRequest("/store/customers/me")
  assert(!("crm" in publicCustomer.customer) && !("notes" in publicCustomer.customer))

  const names = ["LAUNCH_STARTS_AT", "LAUNCH_DISCOUNT_CODE", "SUBSCRIBER_DISCOUNT_CODE"]
  const previous = names.map((name) => process.env[name])
  const prefix = `VERIFY_${Date.now()}`
  process.env.LAUNCH_STARTS_AT = new Date(Date.now() - 60000).toISOString()
  process.env.LAUNCH_DISCOUNT_CODE = `${prefix}_20`
  process.env.SUBSCRIBER_DISCOUNT_CODE = `${prefix}_15`
  const promotionService = container.resolve(Modules.PROMOTION)
  try {
    await seedPromotions({ container, args: [] })
    await seedPromotions({ container, args: [] })
    assert.equal((await promotionService.listPromotions({ code: process.env.LAUNCH_DISCOUNT_CODE })).length, 1)
    const promoCart = { region_id: region.id, items: [{ variant_id: product.variants[0].id, quantity: 1 }] }
    const { cart: subscriberCart } = await customerRequest("/store/carts", { ...promoCart, promo_codes: [process.env.SUBSCRIBER_DISCOUNT_CODE] })
    assert(Number(subscriberCart.discount_total) > 0, "Opted-in customer must receive the subscriber discount")
    const { cart: guestCart } = await request("/store/carts", { ...promoCart, promo_codes: [process.env.SUBSCRIBER_DISCOUNT_CODE] })
    assert.equal(Number(guestCart.discount_total), 0, "Guest must not receive the subscriber discount")
    const { cart: launchCart } = await request("/store/carts", { ...promoCart, promo_codes: [process.env.LAUNCH_DISCOUNT_CODE] })
    assert(Number(launchCart.discount_total) > 0, "Launch discount must apply within its campaign dates")
    const [launch] = await promotionService.listPromotions({ code: process.env.LAUNCH_DISCOUNT_CODE }, { relations: ["campaign"] })
    assert.equal(new Date(launch.campaign!.ends_at!).getTime() - new Date(launch.campaign!.starts_at!).getTime(), 72 * 3600000)
    await customerRequest("/store/customers/me/newsletter", { opted_in: false })
    const { cart: unsubscribedCart } = await customerRequest("/store/carts", { ...promoCart, promo_codes: [process.env.SUBSCRIBER_DISCOUNT_CODE] })
    assert.equal(Number(unsubscribedCart.discount_total), 0, "Opting out must revoke subscriber eligibility")
    console.log("ok: newsletter consent, subscriber eligibility, launch campaign and repeat setup")
  } finally {
    const testPromotions = await promotionService.listPromotions({ code: [process.env.LAUNCH_DISCOUNT_CODE!, process.env.SUBSCRIBER_DISCOUNT_CODE!] }, { relations: ["campaign"] })
    const campaignIds = testPromotions.flatMap((promotion) => promotion.campaign ? [promotion.campaign.id] : [])
    if (testPromotions.length) await deletePromotionsWorkflow(container).run({ input: { ids: testPromotions.map((promotion) => promotion.id) } })
    if (campaignIds.length) await deleteCampaignsWorkflow(container).run({ input: { ids: campaignIds } })
    names.forEach((name, index) => { if (previous[index] === undefined) delete process.env[name]; else process.env[name] = previous[index] })
    await customerRequest("/store/customers/me/newsletter", { opted_in: false })
  }

  await request(`/admin/payments/${paymentId}/refund`, { amount: Number(completed.order.total), note: "Local verification" }, true)
  assert.deepEqual((await request(`/store/orders/${orderId}/digital-downloads`)).digital_products, [])
  assert.notEqual((await fetch(downloads[0].files[0].download_url)).status, 200)
  console.log("ok: refunds revoke existing download tokens and page links")
  console.log("Verified local store. A refunded test order and customer remain as an audit record.")
}
