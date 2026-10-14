import { defineWidgetConfig } from "@medusajs/admin-sdk"
import type { AdminCustomer, DetailWidgetProps } from "@medusajs/framework/types"
import { Button, Container, Heading, Input, Text, Textarea } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { adminRequest, formatMoney } from "../lib/api"

type Crm = { tags: string[]; notes: { id: string; text: string; created_at: string }[]; newsletter_opt_in: boolean }
type Response = { crm: Crm; lifetime_spend: Record<string, number>; orders: { id: string; display_id: number; created_at: string; status: string }[]; orders_truncated: boolean }

const CustomerCrm = ({ data: customer }: DetailWidgetProps<AdminCustomer>) => {
  const [data, setData] = useState<Response>()
  const [tags, setTags] = useState("")
  const [note, setNote] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const url = `/admin/customers/${customer.id}/crm`

  useEffect(() => {
    let canceled = false
    setData(undefined)
    setError("")
    adminRequest<Response>(url).then((result) => { if (!canceled) { setData(result); setTags(result.crm.tags.join(", ")) } }).catch((error) => { if (!canceled) setError(error.message) })
    return () => { canceled = true }
  }, [url])

  const save = async () => {
    setSaving(true)
    setError("")
    try {
      const result = await adminRequest<{ crm: Crm }>(url, { tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean), ...(note.trim() ? { note: note.trim() } : {}) })
      setData((previous) => previous && ({ ...previous, crm: result.crm }))
      setTags(result.crm.tags.join(", "))
      setNote("")
    } catch (error) { setError((error as Error).message) }
    finally { setSaving(false) }
  }

  const timeline = [...(data?.crm.notes || []).map((note) => ({ id: note.id, date: note.created_at, text: note.text, order: null as string | null })), ...(data?.orders || []).map((order) => ({ id: order.id, date: order.created_at, text: `Order #${order.display_id} · ${order.status}`, order: order.id }))].sort((a, b) => Date.parse(b.date) - Date.parse(a.date))

  return <Container>
    <Heading level="h2">Customer relationships</Heading>
    <Text className="text-ui-fg-subtle mt-1">Internal notes and tags are visible only to your team.</Text>
    {error && <p role="alert" className="text-ui-fg-error mt-3">{error}</p>}
    {!data ? <Text className="mt-3">Loading customer record…</Text> : <>
      <div className="flex gap-6 my-4">
        <div><Text size="small">Net lifetime spend{data.orders_truncated ? " (latest 1,000 orders)" : ""}</Text><Text>{Object.entries(data.lifetime_spend).map(([currency, value]) => formatMoney(value, currency)).join(" · ") || "No captured payments"}</Text></div>
        <div><Text size="small">Newsletter consent</Text><Text>{data.crm.newsletter_opt_in ? "Opted in" : "Not subscribed"}</Text></div>
      </div>
      <label className="block mb-4">Tags, separated by commas<Input value={tags} onChange={(event) => setTags(event.target.value)} className="mt-2" /></label>
      <label className="block mb-3">Add a note<Textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={4000} className="mt-2" /></label>
      <Button onClick={save} isLoading={saving}>Save customer record</Button>
      <Heading level="h3" className="mt-6 mb-3">Timeline</Heading>
      {timeline.length ? <ul className="divide-y">{timeline.map((event) => <li key={event.id} className="py-3"><Text size="small" className="text-ui-fg-subtle">{new Date(event.date).toLocaleString()}</Text><Text className="whitespace-pre-wrap">{event.order ? <Link to={`/orders/${event.order}`}>{event.text}</Link> : event.text}</Text></li>)}</ul> : <Text>No notes or orders yet.</Text>}
    </>}
  </Container>
}

export const config = defineWidgetConfig({ zone: "customer.details.after" })
export default CustomerCrm
