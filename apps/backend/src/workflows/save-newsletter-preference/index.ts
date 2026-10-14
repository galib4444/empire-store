import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { acquireLockStep, linkCustomersToCustomerGroupWorkflow, releaseLockStep } from "@medusajs/medusa/core-flows"
import { saveCustomerRecordWorkflow } from "../save-customer-record"

type Input = { customer_id: string; opted_in: boolean }
const saveNewsletterPreferenceStep = createStep("save-newsletter-preference", async (input: Input, { container }) => {
  const customers = container.resolve(Modules.CUSTOMER)
  const customer = await customers.retrieveCustomer(input.customer_id, { relations: ["groups"] })
  let [group] = await customers.listCustomerGroups({ name: "Newsletter subscribers" })
  if (!group) group = await customers.createCustomerGroups({ name: "Newsletter subscribers" })
  const wasMember = customer.groups?.some((existing) => existing.id === group.id) || false
  await linkCustomersToCustomerGroupWorkflow(container).run({ input: { id: group.id, add: input.opted_in ? [input.customer_id] : [], remove: input.opted_in ? [] : [input.customer_id] } })
  try {
    const { result } = await saveCustomerRecordWorkflow(container).run({ input: { customer_id: input.customer_id, actor_id: input.customer_id, newsletter_opt_in: input.opted_in } })
    return new StepResponse({ opted_in: result.newsletter_opt_in })
  } catch (error) {
    await linkCustomersToCustomerGroupWorkflow(container).run({ input: { id: group.id, add: wasMember ? [input.customer_id] : [], remove: wasMember ? [] : [input.customer_id] } })
    throw error
  }
})

export const saveNewsletterPreferenceWorkflow = createWorkflow("save-newsletter-preference", (input: Input) => {
  acquireLockStep({ key: "newsletter-subscriber-group", timeout: 30, ttl: 120 })
  const result = saveNewsletterPreferenceStep(input)
  releaseLockStep({ key: "newsletter-subscriber-group" })
  return new WorkflowResponse(result)
})
