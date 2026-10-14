import { canDownloadOrder } from "../lib/paid-order"
import { createDownloadToken, verifyDownloadToken } from "../lib/download-token"

describe("paid digital access", () => {
  const paid = { status: "pending", total: 19.99, payment_collections: [{ captured_amount: 19.99, refunded_amount: 0 }] }
  it("allows fully captured orders and free orders", () => {
    expect(canDownloadOrder(paid)).toBe(true)
    expect(canDownloadOrder({ status: "pending", total: 0 })).toBe(true)
  })
  it("blocks authorization-only, partial capture, refunds, missing orders and cancellations", () => {
    for (const order of [undefined, { ...paid, status: "canceled" }, { ...paid, payment_collections: [] }, { ...paid, payment_collections: [{ captured_amount: 10 }] }, { ...paid, payment_collections: [{ captured_amount: 19.99, refunded_amount: 1 }] }, { ...paid, total: undefined }]) {
      expect(canDownloadOrder(order)).toBe(false)
    }
  })
  it("adds captures across payment collections", () => {
    expect(canDownloadOrder({ ...paid, payment_collections: [{ captured_amount: 10 }, { captured_amount: 9.99 }] })).toBe(true)
  })
})

describe("download tokens", () => {
  const previous = process.env.DOWNLOAD_TOKEN_SECRET
  beforeAll(() => { process.env.DOWNLOAD_TOKEN_SECRET = "test-download-signing-secret" })
  afterAll(() => { if (previous === undefined) delete process.env.DOWNLOAD_TOKEN_SECRET; else process.env.DOWNLOAD_TOKEN_SECRET = previous })
  it("accepts signed links and rejects tampering, extra segments and expired links", () => {
    const token = createDownloadToken({ dpo: "purchase", media: "file" }, 60)
    expect(verifyDownloadToken(token)?.dpo).toBe("purchase")
    expect(verifyDownloadToken(`${token}.extra`)).toBeNull()
    expect(verifyDownloadToken(`x${token}`)).toBeNull()
    expect(verifyDownloadToken(createDownloadToken({ dpo: "purchase", media: "file" }, 0))).toBeNull()
  })
})
