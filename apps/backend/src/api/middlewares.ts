import {
  configureStoreSearch,
  defineMiddlewares,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework/http"
import { createFindParams } from "@medusajs/medusa/api/utils/validators"
import multer from "multer"
import { z } from "@medusajs/framework/zod"
import { createDigitalProductsSchema } from "./validation-schemas"

const upload = multer({ storage: multer.memoryStorage() })

const GetDigitalProductsSchema = createFindParams()

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/customers/me/newsletter",
      method: "POST",
      middlewares: [validateAndTransformBody(z.object({ opted_in: z.boolean() }).strict())],
    },
    {
      matcher: "/admin/customers/:id/crm",
      method: "POST",
      middlewares: [validateAndTransformBody(z.object({ tags: z.array(z.string().trim().min(1).max(40)).max(30).optional(), note: z.string().trim().min(1).max(4000).optional() }).strict().refine((body) => body.tags !== undefined || body.note !== undefined, "Supply tags or a note"))],
    },
    // The product index declares filterable `status` and `sales_channel_ids`, so
    // the route narrows it to published products in the key's sales channels.
    {
      method: ["POST"],
      matcher: "/store/search",
      middlewares: [
        configureStoreSearch({
          allowed_indexes: {
            product: true,
          },
        }),
      ],
    },
    {
      matcher: "/admin/digital-products",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(GetDigitalProductsSchema, {
          defaults: [
            "id",
            "name",
            "created_at",
            "updated_at",
            "deleted_at",
            "medias.*",
            "product_variant.*",
          ],
          isList: true,
        }),
      ],
    },
    {
      matcher: "/admin/digital-products",
      method: "POST",
      middlewares: [validateAndTransformBody(createDigitalProductsSchema)],
    },
    {
      matcher: "/admin/digital-products/upload**",
      method: "POST",
      middlewares: [upload.array("files")],
    },
  ],
})
