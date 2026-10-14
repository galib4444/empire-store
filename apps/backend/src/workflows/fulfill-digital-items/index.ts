import { MedusaError } from "@medusajs/framework/utils"
import { createStep, createWorkflow, StepResponse, transform, when, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { createFulfillmentWorkflow, createRemoteLinkStep, markOrderFulfillmentAsDeliveredWorkflow, registerOrderFulfillmentStep, useQueryGraphStep } from "@medusajs/medusa/core-flows"

const validateDigitalFulfillmentStep = createStep("validate-digital-fulfillment", async ({ items, locations }: { items: any[]; locations: any[] }) => {
  if (!locations.length) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Create a stock location before delivering digital orders")
  if (items.some((item) => item.variant?.manage_inventory)) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Digital variants must have inventory management disabled")
  }
  return new StepResponse(true)
})

/** Non-shipping items use the fulfillment module without a shipping option. */
export const fulfillDigitalItemsWorkflow = createWorkflow("fulfill-digital-items", (input: { order_id: string; notification?: unknown }) => {
  const { data: orders } = useQueryGraphStep({
    entity: "order",
    fields: ["id", "items.*", "items.detail.*", "items.variant.manage_inventory", "items.variant.digital_product.id", "shipping_address.*"],
    filters: { id: input.order_id },
    options: { throwIfKeyNotFound: true },
  })
  const { data: locations } = useQueryGraphStep({ entity: "stock_location", fields: ["id"], pagination: { take: 1 } }).config({ name: "digital-stock-location" })
  const items = transform({ orders }, ({ orders }) => (orders[0].items || []).filter((item: any) => !item.requires_shipping && item.variant?.digital_product?.id).map((item: any) => ({
    ...item, quantity: Number(item.quantity) - Number(item.detail?.fulfilled_quantity || 0),
  })).filter((item: any) => item.quantity > 0))

  when("unfulfilled-digital-items", { items }, ({ items }) => items.length > 0).then(() => {
    const validated = validateDigitalFulfillmentStep({ items, locations })
    const data = transform({ orders, items, locations, validated, notification: input.notification }, ({ orders, items, locations }) => ({
      location_id: locations[0].id,
      provider_id: "digital_digital",
      requires_shipping: false,
      delivery_address: orders[0].shipping_address || {},
      items: items.map((item: any) => ({ line_item_id: item.id, quantity: item.quantity, title: item.title, sku: item.variant_sku || "", barcode: "" })),
      metadata: { digital_delivery: true },
    }))
    const fulfillment = createFulfillmentWorkflow.runAsStep({ input: data })
    const registered = registerOrderFulfillmentStep(transform({ items, fulfillment, order_id: input.order_id }, ({ items, fulfillment, order_id }) => ({
      order_id, reference: Modules.FULFILLMENT, reference_id: fulfillment.id,
      items: items.map((item: any) => ({ id: item.id, quantity: item.quantity })),
    })))
    const linked = createRemoteLinkStep([{ [Modules.ORDER]: { order_id: input.order_id }, [Modules.FULFILLMENT]: { fulfillment_id: fulfillment.id } }])
    const delivered = transform({ fulfillment, registered, linked, order_id: input.order_id }, ({ fulfillment, order_id }) => ({ orderId: order_id, fulfillmentId: fulfillment.id }))
    markOrderFulfillmentAsDeliveredWorkflow.runAsStep({ input: delivered })
  })

  return new WorkflowResponse({ order_id: input.order_id })
})
