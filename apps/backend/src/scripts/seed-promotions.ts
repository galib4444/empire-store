import { MedusaError } from "@medusajs/framework/utils"
import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { createCustomerGroupsWorkflow, createPromotionsWorkflow } from "@medusajs/medusa/core-flows"
import { loadBrand } from "../lib/brand"

/** Idempotent setup. A launch date is explicit so setup never starts the sale early. */
export default async function seedPromotions({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const start = process.env.LAUNCH_STARTS_AT
  if (!start || !Number.isFinite(Date.parse(start))) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Set LAUNCH_STARTS_AT to an ISO date before creating promotions")
  const customers = container.resolve(Modules.CUSTOMER)
  const promotions = container.resolve(Modules.PROMOTION)
  let [group] = await customers.listCustomerGroups({ name: "Newsletter subscribers" })
  if (!group) {
    const { result } = await createCustomerGroupsWorkflow(container).run({ input: { customersData: [{ name: "Newsletter subscribers" }] } })
    group = result[0]
  }
  const launchCode = process.env.LAUNCH_DISCOUNT_CODE || "LAUNCH20"
  const definitions = [
    { code: launchCode, value: 20, rules: [], campaign: { name: "72-hour launch", campaign_identifier: `${launchCode.toLowerCase()}-72h`, starts_at: new Date(start), ends_at: new Date(Date.parse(start) + 72 * 3600000) } },
    { code: process.env.SUBSCRIBER_DISCOUNT_CODE || "SUBSCRIBER15", value: 15, rules: [{ attribute: "customer.groups.id", operator: "eq" as const, values: [group.id] }] },
  ]
  for (const definition of definitions) {
    if ((await promotions.listPromotions({ code: definition.code })).length) { logger.info(`Keeping existing promotion ${definition.code}`); continue }
    await createPromotionsWorkflow(container).run({ input: { promotionsData: [{
      code: definition.code, type: "standard", status: "active", is_automatic: false,
      application_method: { type: "percentage", target_type: "items", allocation: "across", value: definition.value, currency_code: loadBrand().store.currency },
      rules: definition.rules,
      ...(definition.campaign ? { campaign: definition.campaign } : {}),
    }] } })
    logger.info(`Created promotion ${definition.code}`)
  }
}
