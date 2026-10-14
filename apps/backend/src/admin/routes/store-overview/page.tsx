import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChartBar } from "@medusajs/icons"
import { Container, Heading, Text } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { adminRequest, formatMoney } from "../../lib/api"

type Overview = { orders_count: number; customers_count: number; published_products_count: number; net_revenue: Record<string, number>; pending_download_emails: number; recent_orders: { id: string; display_id: number; status: string; created_at: string }[]; truncated: boolean; integrations: Record<string, string> }

const StoreOverview = () => {
  const [data, setData] = useState<Overview>()
  const [error, setError] = useState("")
  useEffect(() => { adminRequest<Overview>("/admin/store-overview").then(setData).catch((error) => setError(error.message)) }, [])
  return <div className="flex flex-col gap-4">
    <Container><Heading level="h1">Store overview</Heading><Text className="text-ui-fg-subtle mt-1">Orders and net captured revenue from the last 30 days.</Text>{error && <p role="alert" className="text-ui-fg-error mt-3">{error}</p>}</Container>
    {!data ? <Container>Loading overview…</Container> : <>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">{[["Orders", data.orders_count], ["Customers", data.customers_count], ["Published products", data.published_products_count], ["Pending download emails", data.pending_download_emails]].map(([title, value]) => <Container key={title}><Text className="text-ui-fg-subtle">{title}</Text><Heading level="h2" className="mt-2">{value}</Heading></Container>)}</div>
      <Container><Heading level="h2">Net revenue</Heading><Text className="mt-2">{Object.entries(data.net_revenue).map(([currency, amount]) => formatMoney(amount, currency)).join(" · ") || "No captured payments yet"}</Text>{data.truncated && <Text className="text-ui-fg-subtle mt-2">Revenue and pending emails cover the latest 1,000 orders in this period.</Text>}</Container>
      <Container><Heading level="h2">Connections</Heading><div className="flex flex-wrap gap-6 mt-3">{Object.entries(data.integrations).map(([name, mode]) => <Text key={name}>{name}: {mode}</Text>)}</div></Container>
      <Container><Heading level="h2">Recent orders</Heading><ul className="divide-y mt-3">{data.recent_orders.map((order) => <li key={order.id} className="py-3 flex justify-between"><Link to={`/orders/${order.id}`}>Order #{order.display_id}</Link><Text>{order.status} · {new Date(order.created_at).toLocaleDateString()}</Text></li>)}</ul>{!data.recent_orders.length && <Text>No orders in this period.</Text>}</Container>
    </>}
  </div>
}

export const config = defineRouteConfig({ label: "Store overview", icon: ChartBar })
export default StoreOverview
