import { loadEnv, defineConfig } from "@medusajs/framework/utils"
import { integrationConfig } from "./src/lib/runtime-config"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

const integrations = integrationConfig(process.env)

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    },
  },
  modules: [
    ...(process.env.REDIS_URL ? [
      { resolve: "@medusajs/medusa/event-bus-redis", options: { redisUrl: process.env.REDIS_URL } },
      { resolve: "@medusajs/medusa/workflow-engine-redis", options: { redis: { redisUrl: process.env.REDIS_URL } } },
      { resolve: "@medusajs/medusa/locking", options: { providers: [{ resolve: "@medusajs/medusa/locking-redis", id: "redis", is_default: true, options: { redisUrl: process.env.REDIS_URL } }] } },
    ] : []),
    { resolve: "./src/modules/crm" },
    {
      resolve: "./src/modules/digital-product",
    },
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [integrations.file],
      },
    },
    {
      resolve: "@medusajs/medusa/fulfillment",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/fulfillment-manual",
            id: "manual",
          },
          {
            resolve: "./src/modules/digital-product-fulfillment",
            id: "digital",
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [integrations.notification],
      },
    },
    ...(integrations.stripe ? [{
      resolve: "@medusajs/medusa/payment",
      options: { providers: [integrations.stripe] },
    }] : []),
  ],
})
