import { defineWidgetConfig } from "@medusajs/admin-sdk"
import type { AdminOrder, DetailWidgetProps } from "@medusajs/framework/types"
import { Button, Container, Heading, Text } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { adminRequest } from "../lib/api"

type Response = { digital_delivery: { id: string; status: string; updated_at: string } | null; paid: boolean; email_mode: string }

const DigitalDelivery = ({ data: order }: DetailWidgetProps<AdminOrder>) => {
  const [data, setData] = useState<Response>()
  const [error, setError] = useState("")
  const [sending, setSending] = useState(false)
  const url = `/admin/orders/${order.id}/digital-delivery`
  useEffect(() => {
    let canceled = false
    adminRequest<Response>(url).then((result) => { if (!canceled) setData(result) }).catch((error) => { if (!canceled) setError(error.message) })
    return () => { canceled = true }
  }, [url])
  const resend = async () => {
    setSending(true)
    setError("")
    try { await adminRequest(url, {}); setData(await adminRequest<Response>(url)) }
    catch (error) { setError((error as Error).message) }
    finally { setSending(false) }
  }
  if (data && !data.digital_delivery) return null
  return <Container>
    <Heading level="h2">Digital delivery</Heading>
    {error && <p role="alert" className="text-ui-fg-error mt-2">{error}</p>}
    {data?.digital_delivery && <>
      <Text className="mt-3">{!data.paid ? "Downloads locked: payment must be captured and unrefunded." : data.digital_delivery.status === "sent" ? `Download email ${data.email_mode === "console" ? "logged locally" : "accepted by email provider"}.` : "Download email pending."}</Text>
      <Text size="small" className="text-ui-fg-subtle mt-1">Updated {new Date(data.digital_delivery.updated_at).toLocaleString()}</Text>
      <Button className="mt-4" onClick={resend} disabled={!data.paid} isLoading={sending}>Send fresh download links</Button>
    </>}
  </Container>
}

export const config = defineWidgetConfig({ zone: "order.details.after" })
export default DigitalDelivery
