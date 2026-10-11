import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { buildLibrary } from "../../../../../modules/digital-product/lib/library"

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
      "orders.status",
      "orders.digital_product_order.id",
      "orders.digital_product_order.products.id",
      "orders.digital_product_order.products.name",
      "orders.digital_product_order.products.medias.*",
    ],
    filters: { id: req.auth_context.actor_id },
  })

  const digitalOrders = (customer?.orders ?? [])
    .filter((order) => order?.status !== "canceled")
    .map((order) => order?.digital_product_order)

  res.json({ digital_products: buildLibrary(digitalOrders as any) })
}
