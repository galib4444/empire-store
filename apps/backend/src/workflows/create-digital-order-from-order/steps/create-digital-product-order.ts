import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { OrderStatus } from "../../../modules/digital-product/types"
import DigitalProductModuleService from "../../../modules/digital-product/service"
import { DIGITAL_PRODUCT_MODULE } from "../../../modules/digital-product"

export type CreateDigitalProductOrderStepInput = {
  digital_product_ids: string[]
}

const createDigitalProductOrderStep = createStep(
  "create-digital-product-order",
  async (
    { digital_product_ids }: CreateDigitalProductOrderStepInput,
    { container }
  ) => {
    const digitalProductModuleService: DigitalProductModuleService =
      container.resolve(DIGITAL_PRODUCT_MODULE)

    const digitalProductOrder =
      await digitalProductModuleService.createDigitalProductOrders({
        status: OrderStatus.PENDING,
        products: digital_product_ids,
      })

    return new StepResponse(
      { digital_product_order: digitalProductOrder },
      { digital_product_order: digitalProductOrder }
    )
  },
  async (data, { container }) => {
    if (!data) {
      return
    }
    const digitalProductModuleService: DigitalProductModuleService =
      container.resolve(DIGITAL_PRODUCT_MODULE)

    await digitalProductModuleService.deleteDigitalProductOrders(
      data.digital_product_order.id
    )
  }
)

export default createDigitalProductOrderStep
