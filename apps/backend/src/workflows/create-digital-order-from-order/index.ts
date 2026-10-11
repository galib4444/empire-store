import {
  createWorkflow,
  transform,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  acquireLockStep,
  createRemoteLinkStep,
  emitEventStep,
  releaseLockStep,
  useQueryGraphStep,
} from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"
import createDigitalProductOrderStep from "./steps/create-digital-product-order"
import { DIGITAL_PRODUCT_MODULE } from "../../modules/digital-product"
import digitalProductOrderOrderLink from "../../links/digital-product-order"

type WorkflowInput = {
  order_id: string
}

/**
 * Runs after any order is placed. If the order contains digital products, it
 * records what was bought and emits `digital_product_order.created`, which
 * sends the download email. Checkout itself is the standard Medusa flow, so
 * any storefront works without changes.
 */
const createDigitalOrderFromOrderWorkflow = createWorkflow(
  "create-digital-order-from-order",
  (input: WorkflowInput) => {
    acquireLockStep({
      key: input.order_id,
      timeout: 30,
      ttl: 120,
    })

    const { data: orders } = useQueryGraphStep({
      entity: "order",
      fields: ["id", "items.id", "items.variant.digital_product.id"],
      filters: { id: input.order_id },
      options: { throwIfKeyNotFound: true },
    })

    const { data: existingLinks } = useQueryGraphStep({
      entity: digitalProductOrderOrderLink.entryPoint,
      fields: ["digital_product_order_id"],
      filters: { order_id: input.order_id },
    }).config({ name: "retrieve-existing-links" })

    const digitalProductIds = transform({ orders }, (data) => {
      const ids = (data.orders[0].items ?? [])
        .map((item: any) => item?.variant?.digital_product?.id)
        .filter((id: string | undefined): id is string => !!id)
      return Array.from(new Set(ids))
    })

    const digital_product_order = when(
      "order-has-new-digital-items",
      { digitalProductIds, existingLinks },
      (data) =>
        data.digitalProductIds.length > 0 && data.existingLinks.length === 0
    ).then(() => {
      const { digital_product_order } = createDigitalProductOrderStep({
        digital_product_ids: digitalProductIds,
      })

      createRemoteLinkStep([
        {
          [DIGITAL_PRODUCT_MODULE]: {
            digital_product_order_id: digital_product_order.id,
          },
          [Modules.ORDER]: {
            order_id: input.order_id,
          },
        },
      ])

      emitEventStep({
        eventName: "digital_product_order.created",
        data: { id: digital_product_order.id },
      })

      return digital_product_order
    })

    releaseLockStep({ key: input.order_id })

    return new WorkflowResponse({ digital_product_order })
  }
)

export default createDigitalOrderFromOrderWorkflow
