import {
  AuthenticatedMedusaRequest,
  MedusaResponse
} from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"
import type { CreateProductWorkflowInputDTO } from "@medusajs/framework/types"
import createDigitalProductWorkflow from "../../../workflows/create-digital-product"
import { CreateDigitalProductMediaInput } from "../../../workflows/create-digital-product/steps/create-digital-product-medias"
import { createDigitalProductsSchema } from "../../validation-schemas"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { 
    data: digitalProducts,
    metadata: { count, take, skip } = {},
  } = await query.graph({
    entity: "digital_product",
    ...req.queryConfig,
  })

  res.json({
    digital_products: digitalProducts,
    count,
    limit: take,
    offset: skip,
  })
}

/** Upload keys look like "private-1712345678901-My-File.pdf". */
function fileNameFromKey(key: string): string {
  return key.replace(/^(private-)?\d+-/, "")
}

type CreateRequestBody = z.infer<
  typeof createDigitalProductsSchema
>

export const POST = async (
  req: AuthenticatedMedusaRequest<CreateRequestBody>,
  res: MedusaResponse
) => {
  const { result } = await createDigitalProductWorkflow(
    req.scope
  ).run({
    input: {
      digital_product: {
        name: req.validatedBody.name,
        medias: req.validatedBody.medias.map((media) => ({
          fileId: media.file_id,
          mimeType: media.mime_type,
          type: media.type,
          filename: media.filename ?? fileNameFromKey(media.file_id),
        })) as Omit<CreateDigitalProductMediaInput, "digital_product_id">[]
      },
      // No shipping profile: digital products skip the delivery step at checkout.
      product: req.validatedBody.product as unknown as CreateProductWorkflowInputDTO,
    }
  })

  res.json({
    digital_product: result.digital_product
  })
}