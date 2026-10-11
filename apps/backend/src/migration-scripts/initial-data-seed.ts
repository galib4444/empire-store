import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  createApiKeysWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createStockLocationsWorkflow,
  createStoresWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows"
import { loadBrand } from "../lib/brand"

/**
 * One-time store setup, driven by the active brand's `brand.json`: sales
 * channel, storefront API key, currency, selling region and tax region.
 * The catalog is loaded separately by `src/scripts/seed-brand.ts`.
 */
export default async function initial_data_seed({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const brand = loadBrand()
  const { currency, countries, regionName } = brand.store

  logger.info(`Setting up store for ${brand.name}...`)

  const {
    result: [salesChannel],
  } = await createSalesChannelsWorkflow(container).run({
    input: {
      salesChannelsData: [
        { name: "Online Store", description: `${brand.name} website` },
      ],
    },
  })

  const {
    result: [publishableApiKey],
  } = await createApiKeysWorkflow(container).run({
    input: {
      api_keys: [
        { title: "Storefront", type: "publishable", created_by: "" },
      ],
    },
  })

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: { id: publishableApiKey.id, add: [salesChannel.id] },
  })

  await createStoresWorkflow(container).run({
    input: {
      stores: [
        {
          name: brand.name,
          supported_currencies: [{ currency_code: currency, is_default: true }],
          default_sales_channel_id: salesChannel.id,
        },
      ],
    },
  })

  await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: regionName,
          currency_code: currency,
          countries,
          payment_providers: process.env.STRIPE_API_KEY
            ? ["pp_stripe_stripe"]
            : ["pp_system_default"],
        },
      ],
    },
  })

  // Tax rates start at 0 and are set in the admin under Settings > Tax Regions.
  await createTaxRegionsWorkflow(container).run({
    input: countries.map((country_code) => ({
      country_code,
      provider_id: "tp_system",
    })),
  })

  const {
    result: [stockLocation],
  } = await createStockLocationsWorkflow(container).run({
    input: {
      locations: [
        {
          name: "Digital delivery",
          address: { country_code: countries[0].toUpperCase(), address_1: "" },
        },
      ],
    },
  })

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: { id: stockLocation.id, add: [salesChannel.id] },
  })

  logger.info("Store setup finished.")
}
