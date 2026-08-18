import { z } from 'zod'
import { ProductKarat, ProductSort } from '../types/product.enum.js'

export const productQS = z.object({
    page : z.coerce.number().int().positive().min(1).default(1),
    limit : z.coerce.number().int().positive().min(1).max(50).default(20),
    sort : z.enum(ProductSort).optional(),

    q : z.string().trim().max(200).optional(),

    category : z.string().max(100).optional(),
    karat : z.enum(ProductKarat).optional(),
    color : z.array(z.string().trim().max(30)).optional(),
    stone : z.array(z.string().trim().max(50)).optional(),

    minWeight : z.coerce.number().nonnegative().optional(),
    maxWeight : z.coerce.number().nonnegative().optional(),

    minPrice : z.coerce.number().nonnegative().optional(),
    maxPrice : z.coerce.number().nonnegative().optional(),

    discount : z.coerce.boolean().optional(),
    inStock : z.coerce.boolean().optional(),
})

export const adminProductQS = z.object({
    page : z.coerce.number().int().positive().min(1).default(1),
    limit : z.coerce.number().int().positive().min(1).max(50).default(20),
    sort : z.enum(ProductSort).optional(),

    q : z.string().trim().max(200).optional(),

    category : z.array(z.string().trim().max(100)).optional(),
    karat : z.array(z.enum(ProductKarat)).optional(),
    color : z.string().trim().max(30).optional(),
    stone : z.string().trim().max(50).optional(),

    minWeight : z.coerce.number().nonnegative().min(0).optional(),
    maxWeight : z.coerce.number().nonnegative().max(5).optional(),

    minPrice : z.coerce.number().nonnegative().optional(),
    maxPrice : z.coerce.number().nonnegative().optional(),

    minAverageRating : z.coerce.number().nonnegative().optional(),
    maxAverageRating : z.coerce.number().nonnegative().optional(),

    from : z.coerce.date().optional(),
    to : z.coerce.date().optional(),

    discount : z.coerce.boolean().optional(),
    inStock : z.coerce.boolean().optional(),
    isActive : z.coerce.boolean().optional(),
})
.superRefine ((data, ctx) => {
    if (
        data.minWeight !== undefined &&
        data.maxWeight !== undefined &&
        data.minWeight > data.maxWeight
    ) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["maxWeight"],
            message: "MaxWeight Must Be Greater Than Or Equal To MinWeight"

        })
    }

    if (
        data.minPrice !== undefined &&
        data.maxPrice !== undefined &&
        data.minPrice > data.maxPrice
    ) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["maxPrice"],
            message: "MaxPrice Must Be Greater Than Or Equal To MinPrice"

        })
    }

    if (
        data.minAverageRating !== undefined &&
        data.maxAverageRating !== undefined &&
        data.minAverageRating > data.maxAverageRating
    ) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["maxAverageRating"],
            message: "MaxAverageRating Must Be Greater Than Or Equal To MinAverageRating"

        })
    }

    if (
        data.from !== undefined &&
        data.to !== undefined &&
        data.from.getTime() > data.to.getTime()
    ) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["to"],
            message: "To Date Must Be Greater Than Or Equal To From Date"

        })
    }
})

export const createProductSchema = z.object({
    title : z.string().trim().min(1).max(200),
    slug : z.string().trim().min(1).max(200),
    description : z.string().trim().min(1).max(500),
    isActive : z.coerce.boolean()
})

export const changeProductSchema = z.object({
    title : z.string().trim().min(1).max(200).optional(),
    slug : z.string().trim().min(1).max(200).optional(),
    description : z.string().trim().min(1).max(500).optional(),
})
.superRefine((data, ctx) => {
    if (
        data.title === undefined &&
        data.slug === undefined &&
        data.description === undefined
    ) {
        ctx.addIssue({
            code : z.ZodIssueCode.custom,
            message : "All Params Can Not Empty"
        })
    }
})

export const createVariantSchema = z.object({
    weight : z.coerce.number().positive(),
    karat : z.enum(ProductKarat),
    stoneType : z.string().trim().min(1).max(50),
    color : z.string().trim().min(1).max(30),
    sku : z.string().trim().min(1).max(50),
    isActive : z.coerce.boolean().default(true),
})

export const changeVariantSchema = z.object({
    weight : z.coerce.number().positive().optional(),
    karat : z.enum(ProductKarat).optional(),
    stoneType : z.string().trim().min(1).max(50).optional(),
    color : z.string().trim().min(1).max(30).optional(),
    sku : z.string().trim().min(1).max(50).optional(),
})
.superRefine((data, ctx) => {
    if (
        data.weight === undefined &&
        data.karat === undefined &&
        data.stoneType === undefined &&
        data.color === undefined &&
        data.sku === undefined
    ) {
        ctx.addIssue({
            code : z.ZodIssueCode.custom,
            message : "All Params Can Not Empty"
        })
    }
})

export const variantId = z.object({
    variantId : z.coerce.number().int().positive()
})

export const productId = z.object({
    productId : z.coerce.number().int().positive()
})

export const productCategoryIds = z.object({
    productId : z.coerce.number().int().positive(),
    categoryId : z.coerce.number().int().positive(),
})

export const productVariantIds = z.object({
    productId : z.coerce.number().int().positive(),
    variantId : z.coerce.number().int().positive(),
})

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

export const productSlug = z.object({
    slug : z.string().min(1).max(200)
})

export type ProductQSDto = z.infer<typeof productQS>
export type AdminProductQSDto = z.infer<typeof adminProductQS>
export type ProductSlugDto = z.infer<typeof productSlug>
export type ProductIdDto = z.infer<typeof productId>
export type ProductCategoryIdsDto = z.infer<typeof productCategoryIds>
export type ProductVariantIdsDto = z.infer<typeof productVariantIds>
export type ProductVariantImageIdsDto = z.infer<typeof productVariantImageIds>
export type ImageAltTextDto = z.infer<typeof imageAltText>
export type ImageIdsSchemaDto = z.infer<typeof imageIdsSchema>
export type CreateProductSchemaDto = z.infer<typeof createProductSchema>
export type ChangeProductSchemaDto = z.infer<typeof changeProductSchema>
export type CreateVariantSchemaDto = z.infer<typeof createVariantSchema>
export type ChangeVariantSchemaDto = z.infer<typeof changeVariantSchema>