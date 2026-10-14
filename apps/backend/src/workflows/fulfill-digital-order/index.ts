import { createWorkflow, when, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { acquireLockStep, releaseLockStep, useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { sendDigitalOrderNotificationStep } from "./steps/send-digital-order-notification"
import type { SendDigitalOrderNotificationStepInput } from "./steps/send-digital-order-notification"
import { canDownloadOrder, paymentFields } from "../../modules/digital-product/lib/paid-order"
import { fulfillDigitalItemsWorkflow } from "../fulfill-digital-items"

const orderFields = ["*", "products.*", "products.medias.*", "order.id", "order.email", "order.display_id", ...paymentFields.map((field) => `order.${field}`)]

export const fulfillDigitalOrderWorkflow = createWorkflow(
  "fulfill-digital-order",
  (input: { id: string; resend_key?: string }) => {
    acquireLockStep({ key: input.id, timeout: 30, ttl: 120 })
    const { data: orders } = useQueryGraphStep({
      entity: "digital_product_order",
      fields: orderFields,
      filters: { id: input.id },
      options: { throwIfKeyNotFound: true },
    })

    when("paid-digital-order", { orders }, ({ orders }) => canDownloadOrder(orders[0].order)).then(() => {
      const notification = sendDigitalOrderNotificationStep({
        digital_product_order: orders[0], resend_key: input.resend_key,
      } as unknown as SendDigitalOrderNotificationStepInput)
      fulfillDigitalItemsWorkflow.runAsStep({ input: { order_id: orders[0].order!.id, notification } })
    })

    releaseLockStep({ key: input.id })
    return new WorkflowResponse(orders[0])
  }
)
