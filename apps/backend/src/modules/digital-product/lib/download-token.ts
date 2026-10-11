import { createHmac, timingSafeEqual } from "crypto"

export type DownloadTokenPayload = {
  // digital_product_order id: proves which purchase the link belongs to
  dpo: string
  // digital_product_media id
  media: string
  // expiry, unix seconds
  exp: number
}

const DAY = 60 * 60 * 24

/** How long a link sent by email stays valid. */
export const EMAIL_LINK_TTL_SECONDS =
  Number(process.env.DOWNLOAD_LINK_TTL_DAYS || 7) * DAY

/** How long a link shown on a page (library, order confirmation) stays valid. */
export const PAGE_LINK_TTL_SECONDS = 60 * 60

function secret(): string {
  const value = process.env.DOWNLOAD_TOKEN_SECRET || process.env.JWT_SECRET
  if (!value) {
    throw new Error("DOWNLOAD_TOKEN_SECRET or JWT_SECRET must be set")
  }
  return value
}

function sign(body: string): string {
  return createHmac("sha256", secret()).update(body).digest("base64url")
}

export function createDownloadToken(
  data: Omit<DownloadTokenPayload, "exp">,
  ttlSeconds: number
): string {
  const payload: DownloadTokenPayload = {
    ...data,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  }
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url")
  return `${body}.${sign(body)}`
}

/** Returns the payload, or null when the token is malformed, forged or expired. */
export function verifyDownloadToken(token: string): DownloadTokenPayload | null {
  const [body, signature] = token.split(".")
  if (!body || !signature) {
    return null
  }
  const expected = Buffer.from(sign(body))
  const given = Buffer.from(signature)
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return null
  }
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as DownloadTokenPayload
    if (!payload.dpo || !payload.media || typeof payload.exp !== "number") {
      return null
    }
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }
    return payload
  } catch {
    return null
  }
}

export function downloadUrl(token: string): string {
  const base = (process.env.MEDUSA_BACKEND_URL || "http://localhost:9000").replace(
    /\/$/,
    ""
  )
  return `${base}/downloads/${token}`
}
