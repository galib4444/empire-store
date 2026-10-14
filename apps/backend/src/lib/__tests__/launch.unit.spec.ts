import { integrationConfig } from "../runtime-config"
import { editRecord, readRecord, recordForStorage } from "../customer-record"
import { revenueByCurrency } from "../store-metrics"

describe("launch configuration", () => {
  it("keeps local development usable and enables immediate Stripe capture", () => {
    expect(integrationConfig({}).notification.id).toBe("local")
    expect(integrationConfig({ STRIPE_API_KEY: "test" }).stripe?.options.capture).toBe(true)
    expect(integrationConfig({ RESEND_API_KEY: "test", RESEND_FROM_EMAIL: "test@example.com" }).notification.id).toBe("resend")
  })
  it("fails for partial integrations and incomplete production configuration", () => {
    expect(() => integrationConfig({ RESEND_API_KEY: "test" })).toThrow("RESEND_FROM_EMAIL")
    expect(() => integrationConfig({ FILE_PROVIDER: "s3" })).toThrow("S3_FILE_URL")
    expect(() => integrationConfig({ NODE_ENV: "production" })).toThrow("REDIS_URL")
  })
})

describe("customer records and metrics", () => {
  it("preserves notes when tags change, trims duplicates and records the author", () => {
    const first = editRecord(readRecord(), { tags: ["VIP", " VIP "], note: "Asked about the next edition" }, "user_1")
    const second = editRecord(first, { tags: ["Returning"] }, "user_2")
    expect(first.tags).toEqual(["VIP"])
    expect(second.notes[0].created_by).toBe("user_1")
    expect(second.notes).toHaveLength(1)
    expect(readRecord(recordForStorage(second))).toEqual(second)
  })
  it("counts captured revenue net of refunds separately for each currency", () => {
    const base = { id: "1", created_at: new Date(), status: "pending", currency_code: "usd" }
    expect(revenueByCurrency([{ ...base, payment_collections: [{ captured_amount: 20, refunded_amount: 5 }] }, { ...base, currency_code: "eur", payment_collections: [{ captured_amount: 10 }] }, { ...base, status: "canceled", payment_collections: [{ captured_amount: 99 }] }])).toEqual({ usd: 15, eur: 10 })
  })
})
