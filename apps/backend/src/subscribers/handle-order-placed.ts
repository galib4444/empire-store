import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import createDigitalOrderFromOrderWorkflow from "../workflows/create-digital-order-from-order"

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await createDigitalOrderFromOrderWorkflow(container).run({
    input: { order_id: data.id },
  })
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
