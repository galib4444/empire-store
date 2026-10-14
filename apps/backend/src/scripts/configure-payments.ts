import { MedusaError } from "@medusajs/framework/utils"
import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateRegionsWorkflow } from "@medusajs/medusa/core-flows"
import { loadBrand } from "../lib/brand"

/** Run after adding Stripe credentials to switch existing regions off manual payment. */
export default async function configurePayments({ container }: ExecArgs) {
  if (!process.env.STRIPE_API_KEY) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Set STRIPE_API_KEY before configuring payments")
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: regions } = await query.graph({ entity: "region", fields: ["id", "name"], filters: { name: loadBrand().store.regionName } })
  if (!regions.length) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Run the initial store migrations first")
  await updateRegionsWorkflow(container).run({ input: { selector: { id: regions.map((region) => region.id) }, update: { payment_providers: ["pp_stripe_stripe"] } } })
  container.resolve(ContainerRegistrationKeys.LOGGER).info("Stripe is now the only payment provider in the brand's region")
}
