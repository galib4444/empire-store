import { MedusaError } from "@medusajs/framework/utils"
type Environment = Record<string, string | undefined>

export function integrationConfig(env: Environment) {
  const production = env.NODE_ENV === "production"
  const required = (names: string[]) => {
    for (const name of names) {
      if (!env[name]?.trim()) {
        throw new MedusaError(MedusaError.Types.INVALID_DATA, `Set ${name} before enabling this integration`)
      }
    }
  }

  if (production) {
    required(["REDIS_URL", "DATABASE_URL", "JWT_SECRET", "COOKIE_SECRET", "MEDUSA_BACKEND_URL", "STORE_CORS", "ADMIN_CORS", "AUTH_CORS", "STRIPE_API_KEY", "STRIPE_WEBHOOK_SECRET", "RESEND_API_KEY", "RESEND_FROM_EMAIL"])
    for (const name of ["JWT_SECRET", "COOKIE_SECRET", "DOWNLOAD_TOKEN_SECRET"]) {
      if (name === "DOWNLOAD_TOKEN_SECRET" && !env[name]) continue
      if ((env[name] || "").length < 32 || env[name] === "supersecret") {
        throw new MedusaError(MedusaError.Types.INVALID_DATA, `${name} must contain at least 32 characters in production`)
      }
    }
    if (!env.MEDUSA_BACKEND_URL?.startsWith("https://")) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "MEDUSA_BACKEND_URL must use HTTPS in production")
    }
    if (env.FILE_PROVIDER !== "s3") {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Set FILE_PROVIDER=s3 for durable production file storage")
    }
  }

  const stripe = env.STRIPE_API_KEY ? {
    resolve: "@medusajs/medusa/payment-stripe",
    id: "stripe",
    options: { apiKey: env.STRIPE_API_KEY, webhookSecret: env.STRIPE_WEBHOOK_SECRET, capture: true },
  } : undefined

  if (env.RESEND_API_KEY) required(["RESEND_FROM_EMAIL"])
  const notification = env.RESEND_API_KEY ? {
    resolve: "./src/modules/resend",
    id: "resend",
    options: { channels: ["email"], api_key: env.RESEND_API_KEY, from: env.RESEND_FROM_EMAIL },
  } : {
    resolve: "@medusajs/medusa/notification-local",
    id: "local",
    options: { channels: ["email"] },
  }

  if (env.FILE_PROVIDER && !["local", "s3"].includes(env.FILE_PROVIDER)) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "FILE_PROVIDER must be local or s3")
  }
  if (env.FILE_PROVIDER === "s3") required(["S3_FILE_URL", "S3_REGION", "S3_BUCKET", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY"])
  const file = env.FILE_PROVIDER === "s3" ? {
    resolve: "@medusajs/medusa/file-s3",
    id: "s3",
    options: {
      file_url: env.S3_FILE_URL,
      access_key_id: env.S3_ACCESS_KEY_ID,
      secret_access_key: env.S3_SECRET_ACCESS_KEY,
      region: env.S3_REGION,
      bucket: env.S3_BUCKET,
      endpoint: env.S3_ENDPOINT,
      prefix: env.S3_PREFIX || "store/",
      additional_client_config: { forcePathStyle: env.S3_FORCE_PATH_STYLE === "true" },
    },
  } : {
    resolve: "@medusajs/medusa/file-local",
    id: "local",
    options: {
      upload_dir: "static",
      private_upload_dir: "private",
      backend_url: `${env.MEDUSA_BACKEND_URL || "http://localhost:9000"}/static`,
    },
  }

  return { stripe, notification, file }
}
