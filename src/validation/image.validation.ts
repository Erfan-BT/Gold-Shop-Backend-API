import z from "zod"

export const productVariantImageIds = z.object({
    productId : z.coerce.number().int().positive(),
    variantId : z.coerce.number().int().positive(),
    imageId : z.coerce.number().int().positive(),
})

export const imageAltText = z.object({
    altText : z.string().trim().min(1).max(200)
})

export const imageIdsSchema = z.object({
    imageIds : z.array(z.coerce.number().int().positive()).min(1)
})

export type ProductVariantImageIdsDto = z.infer<typeof productVariantImageIds>
export type ImageAltTextDto = z.infer<typeof imageAltText>
export type ImageIdsSchemaDto = z.infer<typeof imageIdsSchema>