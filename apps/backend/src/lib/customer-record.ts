import { MedusaError } from "@medusajs/framework/utils"
import { randomUUID } from "crypto"

export type CustomerNote = { id: string; text: string; created_at: string; created_by: string }
export type RecordData = { tags: string[]; notes: CustomerNote[]; newsletter_opt_in: boolean; consent_at: string | null }

export function readRecord(record?: { tags?: unknown; notes?: unknown; newsletter_opt_in?: boolean; consent_at?: Date | string | null } | null): RecordData {
  const list = (value: unknown): any[] => Array.isArray(value) ? value : (value && typeof value === "object" && Array.isArray((value as any).items)) ? (value as any).items : []
  return {
    tags: list(record?.tags),
    notes: list(record?.notes),
    newsletter_opt_in: record?.newsletter_opt_in || false,
    consent_at: record?.consent_at ? new Date(record.consent_at).toISOString() : null,
  }
}

export function recordForStorage(record: RecordData) {
  return { ...record, tags: { items: record.tags }, notes: { items: record.notes }, consent_at: record.consent_at ? new Date(record.consent_at) : null }
}

export function editRecord(previous: RecordData, input: { tags?: string[]; note?: string; newsletter_opt_in?: boolean }, actorId: string): RecordData {
  const notes = input.note ? [...previous.notes, { id: randomUUID(), text: input.note.trim(), created_at: new Date().toISOString(), created_by: actorId }] : previous.notes
  if (notes.length > 500) throw new MedusaError(MedusaError.Types.INVALID_DATA, "This customer has reached the 500-note limit")
  return {
    tags: input.tags ? Array.from(new Set(input.tags.map((tag) => tag.trim()).filter(Boolean))) : previous.tags,
    notes,
    newsletter_opt_in: input.newsletter_opt_in ?? previous.newsletter_opt_in,
    consent_at: input.newsletter_opt_in === undefined ? previous.consent_at : input.newsletter_opt_in ? new Date().toISOString() : null,
  }
}
