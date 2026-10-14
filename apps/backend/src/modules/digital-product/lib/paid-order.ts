type PaymentCollection = {
  amount?: unknown
  captured_amount?: unknown
  refunded_amount?: unknown
}

export type DownloadOrder = {
  status?: string
  total?: unknown
  payment_collections?: (PaymentCollection | null)[] | null
}

/** Refunds revoke downloads conservatively, including partial refunds. */
export function canDownloadOrder(order: DownloadOrder | null | undefined): boolean {
  if (!order || !order.status || order.status === "canceled") return false
  const total = Number(order.total)
  if (!Number.isFinite(total) || total < 0) return false
  const collections = order.payment_collections || []
  if (collections.some((payment) => Number(payment?.refunded_amount || 0) > 0)) return false
  if (total === 0) return true
  const captured = collections.reduce((sum, payment) => sum + Number(payment?.captured_amount || 0), 0)
  return Number.isFinite(captured) && captured + 0.000001 >= total
}

export const paymentFields = [
  "status", "total", "payment_collections.captured_amount", "payment_collections.refunded_amount",
]
