import { model } from "@medusajs/framework/utils"

// One row per successful download, for the count and the customer timeline.
const DigitalProductDownload = model.define("digital_product_download", {
  id: model.id().primaryKey(),
  media_id: model.text().index(),
  digital_product_order_id: model.text().index(),
  version: model.number(),
})

export default DigitalProductDownload
