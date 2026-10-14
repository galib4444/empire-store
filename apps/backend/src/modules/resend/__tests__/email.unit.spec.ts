import { renderDownloadEmail } from "../template"
import ResendNotificationService from "../service"

describe("download emails", () => {
  const data = { brand_name: "Test store", order_display_id: 12, link_valid_days: 7, products: [{ name: "<script>alert(1)</script>", files: [{ filename: 'Guide "one".pdf', url: "https://example.com/downloads/token" }] }] }
  it("escapes content and includes usable HTML and plain-text links", () => {
    const email = renderDownloadEmail(data)
    expect(email.html).not.toContain("<script>")
    expect(email.html).toContain("&lt;script&gt;")
    expect(email.text).toContain("https://example.com/downloads/token")
    expect(email.subject).toContain("Test store")
  })
  it("rejects executable links", () => {
    expect(() => renderDownloadEmail({ ...data, products: [{ name: "Guide", files: [{ url: "javascript:alert(1)" }] }] })).toThrow()
  })
  it("does not mark a rejected provider send as successful", async () => {
    const previous = global.fetch
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 429 })
    try {
      const provider = new ResendNotificationService({}, { api_key: "test", from: "test@example.com" })
      await expect(provider.send({ to: "buyer@example.com", template: "digital-order-template", channel: "email", data })).rejects.toThrow("429")
    } finally { global.fetch = previous }
  })
})
