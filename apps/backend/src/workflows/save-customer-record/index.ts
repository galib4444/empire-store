import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { acquireLockStep, releaseLockStep } from "@medusajs/medusa/core-flows"
import { CRM_MODULE } from "../../modules/crm"
import CrmService from "../../modules/crm/service"
import { editRecord, readRecord, recordForStorage } from "../../lib/customer-record"

type Input = { customer_id: string; actor_id: string; tags?: string[]; note?: string; newsletter_opt_in?: boolean }

const saveCustomerRecordStep = createStep("save-customer-record", async (input: Input, { container }) => {
  const service: CrmService = container.resolve(CRM_MODULE)
  const [previous] = await service.listCustomerRecords({ customer_id: input.customer_id })
  const data = recordForStorage(editRecord(readRecord(previous), input, input.actor_id))
  const record = previous ? await service.updateCustomerRecords({ id: previous.id, ...data }) : await service.createCustomerRecords({ customer_id: input.customer_id, ...data })
  return new StepResponse(record, { id: record.id, previous: previous ? readRecord(previous) : null })
}, async (data, { container }) => {
  if (!data) return
  const service: CrmService = container.resolve(CRM_MODULE)
  if (data.previous) await service.updateCustomerRecords({ id: data.id, ...recordForStorage(data.previous) })
  else await service.deleteCustomerRecords(data.id)
})

export const saveCustomerRecordWorkflow = createWorkflow("save-customer-record", (input: Input) => {
  acquireLockStep({ key: input.customer_id, timeout: 30, ttl: 120 })
  const record = saveCustomerRecordStep(input)
  releaseLockStep({ key: input.customer_id })
  return new WorkflowResponse(record)
})
