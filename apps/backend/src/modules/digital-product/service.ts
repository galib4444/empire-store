import { MedusaService } from "@medusajs/framework/utils"
import DigitalProduct from "./models/digital-product"
import DigitalProductOrder from "./models/digital-product-order"
import DigitalProductMedia from "./models/digital-product-media"
import DigitalProductDownload from "./models/digital-product-download"

class DigitalProductModuleService extends MedusaService({
  DigitalProduct,
  DigitalProductMedia,
  DigitalProductOrder,
  DigitalProductDownload,
}) {}

export default DigitalProductModuleService
