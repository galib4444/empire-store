import { MedusaError } from "@medusajs/framework/utils"
type Product = { name: string; files: { filename?: string; url: string }[] }

export function renderDownloadEmail(data: Record<string, unknown>) {
  const escape = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]!)
  const products = (data.products || []) as Product[]
  const brand = String(data.brand_name || "Your store")
  const subject = data.new_edition ? `A new edition of your download from ${brand}` : `Your downloads from ${brand}`
  const intro = data.new_edition ? "A new edition of a product you own is ready." : `Thank you for your order #${data.order_display_id}. Your files are ready.`
  const text = [intro, ...products.flatMap((product) => [product.name, ...product.files.map((file) => `${file.filename || "Download"}: ${file.url}`)]), `These links expire in ${data.link_valid_days} days.`, "You can also find fresh links in your account library."] .join("\n\n")
  const html = `<main style="font-family:Arial,sans-serif;max-width:600px;margin:32px auto;color:#202020"><h1>${escape(brand)}</h1><p>${escape(intro)}</p>${products.map((product) => `<h2>${escape(product.name)}</h2><ul>${product.files.map((file) => {
    if (!/^https?:\/\//.test(file.url)) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Download links must use HTTP or HTTPS")
    return `<li><a href="${escape(file.url)}">${escape(file.filename || "Download")}</a></li>`
  }).join("")}</ul>`).join("")}<p>These links expire in ${escape(data.link_valid_days)} days. You can also find fresh links in your account library.</p></main>`
  return { subject, text, html }
}
