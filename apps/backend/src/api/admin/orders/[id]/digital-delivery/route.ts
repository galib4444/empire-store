import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { randomUUID } from "crypto"
import { canDownloadOrder, paymentFields } from "../../../../../modules/digital-product/lib/paid-order"
import { fulfillDigitalOrderWorkflow } from "../../../../../workflows/fulfill-digital-order"

async function getOrder(req: AuthenticatedMedusaRequest) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: [order] } = await query.graph({
    entity: "order", fields: ["id", ...paymentFields, "digital_product_order.id", "digital_product_order.status", "digital_product_order.updated_at"],
    filters: { id: req.params.id },
  })
  if (!order) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Order not found")
  return order
}

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const order = await getOrder(req)
  res.json({ digital_delivery: order.digital_product_order || null, paid: canDownloadOrder(order), email_mode: process.env.RESEND_API_KEY ? "resend" : "console" })
}

export const POST = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const order = await getOrder(req)
  if (!canDownloadOrder(order) || !order.digital_product_order) {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "A paid digital order is required")
  }
  await fulfillDigitalOrderWorkflow(req.scope).run({ input: { id: order.digital_product_order.id, resend_key: randomUUID() } })
  res.json({ digital_delivery: (await getOrder(req)).digital_product_order })
}
