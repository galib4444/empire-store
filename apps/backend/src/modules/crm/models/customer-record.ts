import { model } from "@medusajs/framework/utils"

/** Kept in a private module so customer-facing metadata never exposes notes. */
export default model.define("customer_record", {
  id: model.id().primaryKey(),
  customer_id: model.text().unique(),
  tags: model.json().default({ items: [] }),
  notes: model.json().default({ items: [] }),
  newsletter_opt_in: model.boolean().default(false),
  consent_at: model.dateTime().nullable(),
})
