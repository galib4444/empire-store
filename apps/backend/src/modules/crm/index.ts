import { Module } from "@medusajs/framework/utils"
import CrmService from "./service"

export const CRM_MODULE = "crm"
export default Module(CRM_MODULE, { service: CrmService })
