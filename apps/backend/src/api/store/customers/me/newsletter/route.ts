import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CRM_MODULE } from "../../../../../modules/crm"
import CrmService from "../../../../../modules/crm/service"
import { saveNewsletterPreferenceWorkflow } from "../../../../../workflows/save-newsletter-preference"

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const service: CrmService = req.scope.resolve(CRM_MODULE)
  const [record] = await service.listCustomerRecords({ customer_id: req.auth_context.actor_id })
  res.json({ opted_in: record?.newsletter_opt_in || false })
}

export const POST = async (req: AuthenticatedMedusaRequest<{ opted_in: boolean }>, res: MedusaResponse) => {
  const { result } = await saveNewsletterPreferenceWorkflow(req.scope).run({ input: { customer_id: req.auth_context.actor_id, opted_in: req.validatedBody.opted_in } })
  res.json(result)
}
