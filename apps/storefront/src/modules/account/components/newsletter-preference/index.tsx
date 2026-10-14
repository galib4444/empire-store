"use client"

import { newsletterPreference, saveNewsletterPreference } from "@lib/data/newsletter"
import { useEffect, useState } from "react"

export default function NewsletterPreference() {
  const [optedIn, setOptedIn] = useState<boolean>()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  useEffect(() => { newsletterPreference().then((result) => setOptedIn(result.opted_in)).catch(() => setError("Could not load your email preferences.")) }, [])
  const change = async () => {
    setSaving(true)
    setError("")
    try { const result = await saveNewsletterPreference(!optedIn); setOptedIn(result.opted_in) }
    catch { setError("Could not save your preference. Please try again.") }
    finally { setSaving(false) }
  }
  return <section>
    <h2 className="text-lg font-medium">Email preferences</h2>
    <p className="mt-2 text-sm text-gray-600">Choose whether to receive product news and offers. Order receipts and download emails are sent for your purchases.</p>
    {error && <p role="alert" className="mt-2 text-red-600">{error}</p>}
    <label className="mt-4 flex items-center gap-3"><input type="checkbox" checked={optedIn || false} disabled={optedIn === undefined || saving} onChange={change} />Send me product news and subscriber offers</label>
    {saving && <p role="status" className="mt-2 text-sm">Saving…</p>}
  </section>
}
