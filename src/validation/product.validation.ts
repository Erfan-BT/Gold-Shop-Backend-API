import { z } from 'zod'
import { ProductKarat, ProductSort } from '../types/product.enum.js'

export const productQS = z.object({
    page : z.coerce.number().int().positive().default(1),
    limit : z.coerce.number().int().positive().max(50).default(20),
    sort : z.enum(ProductSort).optional(),

    q : z.string().trim().max(200).optional(),

    category : z.array(z.string().trim().max(100)).optional(),
    karat : z.array(z.enum(ProductKarat)).optional(),
    color : z.string().trim().max(30).optional(),
    stone : z.string().trim().max(50).optional(),

    minWeight : z.coerce.number().nonnegative().min(0).optional(),
    maxWeight : z.coerce.number().nonnegative().max(50).optional(),

    minPrice : z.coerce.number().nonnegative().optional(),
    maxPrice : z.coerce.number().nonnegative().optional(),

    discount : z.coerce.boolean().optional(),
    inStock : z.coerce.boolean().optional(),
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
            message: "Max Weight Must Be Greater Than Or Equal To Min Weight"

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
            message: "Max Price Must Be Greater Than Or Equal To Min Price"

        })
    }
})

export const adminProductQS = z.object({
    page : z.coerce.number().int().positive().default(1),
    limit : z.coerce.number().int().positive().max(50).default(20),
    sort : z.enum(ProductSort).optional(),

    q : z.string().trim().max(200).optional(),

    category : z.array(z.string().trim().max(100)).min(1).optional(),
    karat : z.array(z.enum(ProductKarat)).min(1).optional(),
    color : z.string().trim().max(30).optional(),
    stone : z.string().trim().max(50).optional(),

    minWeight : z.coerce.number().nonnegative().optional(),
    maxWeight : z.coerce.number().nonnegative().max(50).optional(),

    minPrice : z.coerce.number().nonnegative().optional(),
    maxPrice : z.coerce.number().nonnegative().optional(),

    minAverageRating : z.coerce.number().nonnegative().optional(),
    maxAverageRating : z.coerce.number().nonnegative().max(5).optional(),

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
            message: "Max Weight Must Be Greater Than Or Equal To Min Weight"

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
            message: "Max Price Must Be Greater Than Or Equal To Min Price"

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
            message: "Max Average Rating Must Be Greater Than Or Equal To Min Average Rating"

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
    title : z.string().trim().min(1, 'At Least A Character Is Required').max(200, 'Max : 200 Characters'),
    slug : z.string().trim().min(1, 'At Least A Character Is Required').max(200, 'Max : 200 Characters'),
    description : z.string().trim().min(1, 'At Least A Character Is Required').max(500, 'Max : 500 Characters'),
    isActive : z.coerce.boolean().default(true)
})

export const changeProductSchema = z.object({
    title : z.string().trim().min(1, 'At Least A Character Is Required').max(200, 'Max : 200 Characters').optional(),
    slug : z.string().trim().min(1, 'At Least A Character Is Required').max(200, 'Max : 200 Characters').optional(),
    description : z.string().trim().min(1, 'At Least A Character Is Required').max(500, 'Max : 500 Characters').optional(),
})
.superRefine((data, ctx) => {
    if (
        data.title === undefined &&
        data.slug === undefined &&
        data.description === undefined
    ) {
        ctx.addIssue({
            code : z.ZodIssueCode.custom,
            message: "At Least One Of The Fields Is Required"
        })
    }
})

export const createVariantSchema = z.object({
    weight : z.coerce.number().positive(),
    karat : z.enum(ProductKarat),
    stoneType : z.string().trim().min(1, 'At Least A Character Is Required').max(50, 'Max : 50 Character'),
    color : z.string().trim().min(1, 'At Least A Character Is Required').max(30, 'Max : 30 Character'),
    sku : z.string().trim().min(1, 'At Least A Character Is Required').max(50, 'Max : 50 Character'),
    isActive : z.coerce.boolean().default(true),
    quantity : z.coerce.number().int().nonnegative().default(0)
})

export const changeVariantSchema = z.object({
    weight : z.coerce.number().positive().optional(),
    karat : z.enum(ProductKarat).optional(),
    stoneType : z.string().trim().min(1, 'At Least A Character Is Required').max(50, 'Max : 50 Character').optional(),
    color : z.string().trim().min(1, 'At Least A Character Is Required').max(30, 'Max : 30 Character').optional(),
    sku : z.string().trim().min(1, 'At Least A Character Is Required').max(50, 'Max : 50 Character').optional(),
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
            message: "At Least One Of The Fields Is Required"
        })
    }
})

export const variantIdSchema = z.object({
    variantId : z.coerce.number().int().positive()
})

export const productIdSchema = z.object({
    productId : z.coerce.number().int().positive()
})

export const productVariantIdsSchema = z.object({
    productId : z.coerce.number().int().positive(),
    variantId : z.coerce.number().int().positive(),
})

export const productSlugSchema = z.object({
    slug : z.string().min(1).max(200)
})

export type ProductQSDto = z.infer<typeof productQS>
export type AdminProductQSDto = z.infer<typeof adminProductQS>
export type ProductSlugDto = z.infer<typeof productSlugSchema>
export type VariantIdDto = z.infer<typeof variantIdSchema>
export type ProductIdDto = z.infer<typeof productIdSchema>
export type ProductVariantIdsDto = z.infer<typeof productVariantIdsSchema>
export type CreateProductDto = z.infer<typeof createProductSchema>
export type ChangeProductDto = z.infer<typeof changeProductSchema>
export type CreateVariantDto = z.infer<typeof createVariantSchema>
export type ChangeVariantDto = z.infer<typeof changeVariantSchema>