import { MedusaError } from "@medusajs/framework/utils"
import { AbstractNotificationProviderService } from "@medusajs/framework/utils"
import type { ProviderSendNotificationDTO, ProviderSendNotificationResultsDTO } from "@medusajs/framework/types"
import { renderDownloadEmail } from "./template"

type Options = { api_key: string; from: string }

export default class ResendNotificationService extends AbstractNotificationProviderService {
  static identifier = "notification-resend"
  private options: Options

  constructor(_dependencies: Record<string, unknown>, options: Options) {
    super()
    this.options = options
  }

  static validateOptions(options: Record<string, unknown>) {
    if (!options.api_key || !options.from) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Resend requires api_key and from")
  }

  async send(notification: ProviderSendNotificationDTO): Promise<ProviderSendNotificationResultsDTO> {
    if (notification.channel !== "email" || !["digital-order-template", "new-edition-template"].includes(notification.template)) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, `Unsupported notification template: ${notification.template}`)
    }
    const content = renderDownloadEmail(notification.data || {})
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.options.api_key}`,
        "Content-Type": "application/json",
        ...(notification.provider_data?.idempotency_key ? { "Idempotency-Key": String(notification.provider_data.idempotency_key) } : {}),
      },
      body: JSON.stringify({ from: this.options.from, to: [notification.to], ...content }),
      signal: AbortSignal.timeout(15000),
    })
    if (!response.ok) throw new MedusaError(MedusaError.Types.INVALID_DATA, `Resend rejected the email (HTTP ${response.status})`)
    const result = await response.json() as { id?: string }
    if (!result.id) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Resend did not return a delivery identifier")
    return { id: result.id }
  }
}
