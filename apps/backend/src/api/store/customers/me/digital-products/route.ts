import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { buildLibrary } from "../../../../../modules/digital-product/lib/library"
import { canDownloadOrder, paymentFields } from "../../../../../modules/digital-product/lib/paid-order"

/** The signed-in customer's library: every digital product they own. */
export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const {
    data: [customer],
  } = await query.graph({
    entity: "customer",
    fields: [
      ...paymentFields.map((field) => `orders.${field}`),
      "orders.digital_product_order.id",
      "orders.digital_product_order.products.id",
      "orders.digital_product_order.products.name",
      "orders.digital_product_order.products.medias.*",
    ],
    filters: { id: req.auth_context.actor_id },
  })

  const digitalOrders = (customer?.orders ?? [])
    .filter((order) => canDownloadOrder(order))
    .map((order) => order?.digital_product_order)

  res.json({ digital_products: buildLibrary(digitalOrders as any) })
}
