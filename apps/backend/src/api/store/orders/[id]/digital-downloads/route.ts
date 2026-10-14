import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { buildLibrary } from "../../../../../modules/digital-product/lib/library"
import { canDownloadOrder, paymentFields } from "../../../../../modules/digital-product/lib/paid-order"

/**
 * Download links for one order, for the order confirmation page. Like
 * Medusa's own `GET /store/orders/:id`, it is reachable by anyone who holds
 * the order id, which lets guests download without an account.
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const {
    data: [order],
  } = await query.graph({
    entity: "order",
    fields: [
      ...paymentFields,
      "digital_product_order.id",
      "digital_product_order.products.id",
      "digital_product_order.products.name",
      "digital_product_order.products.medias.*",
    ],
    filters: { id: req.params.id },
  })

  const owned =
    canDownloadOrder(order) ? [order.digital_product_order] : []

  res.json({ digital_products: buildLibrary(owned as any) })
}
