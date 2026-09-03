import z from "zod"

export const productVariantImageIdsSchema = z.object({
    productId : z.coerce.number().int().positive(),
    variantId : z.coerce.number().int().positive(),
    imageId : z.coerce.number().int().positive(),
})

export const imageAltTextSchema = z.object({
    altText : z.string().trim().min(1, 'At Least A Character Is Required').max(200, 'Max : 200 Characters')
})

export const imageIdsSchema = z.object({
    imageIds : z.array(z.coerce.number().int().positive()).min(1)
})

export type ProductVariantImageIdsDto = z.infer<typeof productVariantImageIdsSchema>
export type ImageAltTextDto = z.infer<typeof imageAltTextSchema>
export type ImageIdsDto = z.infer<typeof imageIdsSchema>