import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { INotificationModuleService } from "@medusajs/framework/types"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import {
  DigitalProductOrder,
  MediaType,
  OrderStatus,
} from "../../../modules/digital-product/types"
import { DIGITAL_PRODUCT_MODULE } from "../../../modules/digital-product"
import DigitalProductModuleService from "../../../modules/digital-product/service"
import { loadBrand } from "../../../lib/brand"
import {
  createDownloadToken,
  downloadUrl,
  EMAIL_LINK_TTL_SECONDS,
} from "../../../modules/digital-product/lib/download-token"

export type SendDigitalOrderNotificationStepInput = {
  digital_product_order: DigitalProductOrder
  resend_key?: string
}

export const sendDigitalOrderNotificationStep = createStep(
  "send-digital-order-notification",
  async (
    {
      digital_product_order: digitalProductOrder,
      resend_key,
    }: SendDigitalOrderNotificationStepInput,
    { container }
  ) => {
    const notificationModuleService: INotificationModuleService =
      container.resolve(Modules.NOTIFICATION)

    if (!digitalProductOrder.order) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Digital product order is missing associated order."
      )
    }

    if (!digitalProductOrder.order.email) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Order is missing email."
      )
    }

    const products = digitalProductOrder.products.map((product) => ({
      name: product.name,
      files: product.medias
        .filter((media) => media.type === MediaType.MAIN)
        .map((media) => ({
          filename: media.filename,
          url: downloadUrl(
            createDownloadToken(
              { dpo: digitalProductOrder.id, media: media.id },
              EMAIL_LINK_TTL_SECONDS
            )
          ),
        })),
    }))

    const key = `downloads:${digitalProductOrder.id}:${resend_key || "initial"}`
    const [alreadySent] = await notificationModuleService.listNotifications({ idempotency_key: key, status: "success" } as any)
    const notification = alreadySent || await notificationModuleService.createNotifications({
      to: digitalProductOrder.order.email,
      template: "digital-order-template",
      channel: "email",
      idempotency_key: key,
      provider_data: { idempotency_key: key },
      data: {
        brand_name: loadBrand().name,
        order_display_id: (digitalProductOrder.order as any).display_id,
        link_valid_days: Math.round(EMAIL_LINK_TTL_SECONDS / 86400),
        products,
      },
    })

    const digitalProductModuleService: DigitalProductModuleService =
      container.resolve(DIGITAL_PRODUCT_MODULE)
    await digitalProductModuleService.updateDigitalProductOrders({
      id: digitalProductOrder.id,
      status: OrderStatus.SENT,
    })

    return new StepResponse(notification)
  }
)
