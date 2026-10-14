import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { DIGITAL_PRODUCT_MODULE } from "../../modules/digital-product"
import DigitalProductModuleService from "../../modules/digital-product/service"

type Input = { media_id: string; digital_product_order_id: string; version: number }
const logDigitalDownloadStep = createStep("log-digital-download", async (input: Input, { container }) => {
  const service: DigitalProductModuleService = container.resolve(DIGITAL_PRODUCT_MODULE)
  const download = await service.createDigitalProductDownloads(input)
  return new StepResponse(download, download.id)
}, async (id, { container }) => {
  if (id) await (container.resolve(DIGITAL_PRODUCT_MODULE) as DigitalProductModuleService).deleteDigitalProductDownloads(id)
})

export const logDigitalDownloadWorkflow = createWorkflow("log-digital-download", (input: Input) => new WorkflowResponse(logDigitalDownloadStep(input)))
