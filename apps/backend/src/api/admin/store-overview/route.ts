import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { metricsOrderFields, revenueByCurrency } from "../../../lib/store-metrics"

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const since = new Date(Date.now() - 30 * 86400000)
  const { data: orders, metadata } = await query.graph({ entity: "order", fields: [...metricsOrderFields, "digital_product_order.status"], filters: { created_at: { $gte: since } }, pagination: { take: 1000, order: { created_at: "DESC" } } })
  const { metadata: customers } = await query.graph({ entity: "customer", fields: ["id"], pagination: { take: 1 } })
  const { metadata: products } = await query.graph({ entity: "product", fields: ["id"], filters: { status: "published" }, pagination: { take: 1 } })
  res.json({
    period_days: 30, orders_count: metadata?.count || 0, customers_count: customers?.count || 0, published_products_count: products?.count || 0,
    net_revenue: revenueByCurrency(orders as any), pending_download_emails: orders.filter((order: any) => order.digital_product_order?.status === "pending").length,
    recent_orders: orders.slice(0, 10), truncated: (metadata?.count || 0) > orders.length,
    integrations: { payments: process.env.STRIPE_API_KEY ? "stripe" : "manual", email: process.env.RESEND_API_KEY ? "resend" : "console", files: process.env.FILE_PROVIDER || "local" },
  })
}
