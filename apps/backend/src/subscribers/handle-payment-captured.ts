import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import createDigitalOrderFromOrderWorkflow from "../workflows/create-digital-order-from-order"
import { fulfillDigitalOrderWorkflow } from "../workflows/fulfill-digital-order"

export default async function paymentCapturedHandler({ event: { data }, container }: SubscriberArgs<{ id: string }>) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: [payment] } = await query.graph({ entity: "payment", fields: ["payment_collection.order.id"], filters: { id: data.id } })
  const orderId = payment?.payment_collection?.order?.id
  if (!orderId) return
  await createDigitalOrderFromOrderWorkflow(container).run({ input: { order_id: orderId } })
  const { data: [order] } = await query.graph({ entity: "order", fields: ["digital_product_order.id"], filters: { id: orderId } })
  if (order?.digital_product_order?.id) {
    await fulfillDigitalOrderWorkflow(container).run({ input: { id: order.digital_product_order.id } })
  }
}

export const config: SubscriberConfig = { event: "payment.captured" }
