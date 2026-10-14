import { MedusaService } from "@medusajs/framework/utils"
import CustomerRecord from "./models/customer-record"

export default class CrmService extends MedusaService({ CustomerRecord }) {}
