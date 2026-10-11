import { model } from "@medusajs/framework/utils"
import { MediaType } from "../types"
import DigitalProduct from "./digital-product"

const DigitalProductMedia = model.define("digital_product_media", {
  id: model.id().primaryKey(),
  type: model.enum(MediaType),
  fileId: model.text(),
  mimeType: model.text(),
  // The name the buyer's file is saved under, e.g. "My-Guide.pdf".
  filename: model.text().nullable(),
  // Bumped when a new edition replaces the file. The media id stays the same,
  // so links and libraries of earlier buyers serve the newest edition.
  version: model.number().default(1),
  digitalProduct: model.belongsTo(() => DigitalProduct, {
    mappedBy: "medias"
  })
})

export default DigitalProductMedia
