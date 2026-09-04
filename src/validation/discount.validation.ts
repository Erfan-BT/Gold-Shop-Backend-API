import z from "zod"

export const createVariantDiscountSchema = z.object({
    type : z.enum(["fixed" , "percent"]),
    value : z.coerce.number().nonnegative(),
    startDate : z.coerce.date(),
    endDate : z.coerce.date().nullable(),
    isActive : z.coerce.boolean().default(false)
})
.superRefine((data, ctx) => {
    if (
        data.type === 'percent' &&
        data.value > 100
    ) {
        ctx.addIssue({
            code : z.ZodIssueCode.custom,
            path : ['value'],
            message : 'Discount Percent Must Be Between 0 And 100'
        })
    }

    if (
        data.endDate !== null &&
        data.startDate.getTime() > data.endDate.getTime()
    ) {
        ctx.addIssue({
            code : z.ZodIssueCode.custom,
            path : ['endDate'],
            message : 'End Date Must Be Greater Than Or Equal To Start Date'
        })
    }
})

export const changeVariantDiscountSchema = z.object({
    type : z.enum(["fixed" , "percent"]).optional(),
    value : z.coerce.number().nonnegative().optional(),
    startDate : z.coerce.date().optional(),
    endDate : z.coerce.date().nullable().optional(),
})
.superRefine((data, ctx) => {
    if (
        data.type === undefined &&
        data.value === undefined &&
        data.startDate === undefined &&
        data.endDate === undefined
    ) {
        ctx.addIssue({
            code : z.ZodIssueCode.custom,
            message: "At Least One Of The Fields Is Required"
        })
    }
    if (
        data.type !== undefined &&
        data.value !== undefined &&
        data.type === 'percent' &&
        data.value > 100
    ) {
        ctx.addIssue({
            code : z.ZodIssueCode.custom,
            path : ['value'],
            message : 'Discount Percent Must Be Between 0 And 100'
        })
    }

    if (
        data.startDate !== undefined &&
        data.endDate !== undefined &&
        data.endDate !== null &&
        data.startDate.getTime() > data.endDate.getTime()
    ) {
        ctx.addIssue({
            code : z.ZodIssueCode.custom,
            path : ['endDate'],
            message : 'End Date Must Be Greater Than Or Equal To Start Date'
        })
    }
})

export const productVariantDiscountIdsSchema = z.object({
    productId : z.coerce.number().int().positive(),
    variantId : z.coerce.number().int().positive(),
    discountId : z.coerce.number().int().positive(),
})

export type CreateVariantDiscountDto = z.infer<typeof createVariantDiscountSchema>
export type ChangeVariantDiscountDto = z.infer<typeof changeVariantDiscountSchema>
export type ProductVariantDiscountIdsDto = z.infer<typeof productVariantDiscountIdsSchema>