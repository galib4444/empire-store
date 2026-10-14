type Order = { id: string; status: string; currency_code: string; created_at: string | Date; payment_collections?: { captured_amount?: unknown; refunded_amount?: unknown }[] | null }

export function revenueByCurrency(orders: Order[]) {
  const revenue: Record<string, number> = {}
  for (const order of orders) {
    if (order.status === "canceled") continue
    const net = (order.payment_collections || []).reduce((sum, payment) => sum + Number(payment.captured_amount || 0) - Number(payment.refunded_amount || 0), 0)
    revenue[order.currency_code] = (revenue[order.currency_code] || 0) + net
  }
  return revenue
}

export const metricsOrderFields = ["id", "display_id", "status", "currency_code", "created_at", "payment_collections.captured_amount", "payment_collections.refunded_amount"]
