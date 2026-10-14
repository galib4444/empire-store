import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { CRM_MODULE } from "../../../../../modules/crm"
import CrmService from "../../../../../modules/crm/service"
import { readRecord } from "../../../../../lib/customer-record"
import { metricsOrderFields, revenueByCurrency } from "../../../../../lib/store-metrics"
import { saveCustomerRecordWorkflow } from "../../../../../workflows/save-customer-record"

async function customer(req: AuthenticatedMedusaRequest) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: [customer] } = await query.graph({ entity: "customer", fields: ["id", "email"], filters: { id: req.params.id } })
  if (!customer) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Customer not found")
  return customer
}

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  await customer(req)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const crm: CrmService = req.scope.resolve(CRM_MODULE)
  const [record] = await crm.listCustomerRecords({ customer_id: req.params.id })
  const { data: orders } = await query.graph({ entity: "order", fields: metricsOrderFields, filters: { customer_id: req.params.id }, pagination: { take: 1000, order: { created_at: "DESC" } } })
  res.json({ crm: readRecord(record), lifetime_spend: revenueByCurrency(orders as any), orders, orders_truncated: orders.length === 1000 })
}

export const POST = async (req: AuthenticatedMedusaRequest<{ tags?: string[]; note?: string }>, res: MedusaResponse) => {
  await customer(req)
  const { result } = await saveCustomerRecordWorkflow(req.scope).run({ input: { customer_id: req.params.id, actor_id: req.auth_context.actor_id, ...req.validatedBody } })
  res.json({ crm: readRecord(result) })
}
