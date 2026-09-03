import z from "zod";

export const createVariantPricingSchema = z.object({
    wageType : z.enum(["fixed" , "percent"]),
    wageValue : z.coerce.number().nonnegative(),
    profitType : z.enum(["fixed" , "percent"]),
    profitValue : z.coerce.number().nonnegative(),
    taxPercent : z.coerce.number().nonnegative().max(100, 'Max : 100'),
    priority : z.coerce.number().int().positive().max(10, 'Max : 10'),
    validFrom : z.coerce.date(),    
    validTo : z.coerce.date().nullable(),
    isActive : z.coerce.boolean().default(true)
})
.superRefine((data, ctx) => {
    if (
        data.validTo !== null &&
        data.validFrom.getTime() > data.validTo.getTime()
    ) {
        ctx.addIssue({
            code : z.ZodIssueCode.custom,
            path : ['validTo'],
            message : 'Valid To Date Must Be Greater Than Or Equal To Valid From Date'
        })
    }

    if (
        data.wageType === 'percent' &&
        data.wageValue > 100
    ) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['wageValue'],
            message:
                'Wage Percent Must Be Between 0 And 100'
        });
    }

    if (
        data.profitType === 'percent' &&
        data.profitValue > 100
    ) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['profitValue'],
            message:
                'Profit Percent Must Be Between 0 And 100'
        });
    }
})

export const changeVariantPricingSchema = z.object({
    wageType : z.enum(["fixed" , "percent"]).optional(),
    wageValue : z.coerce.number().nonnegative().optional(),
    profitType : z.enum(["fixed" , "percent"]).optional(),
    profitValue : z.coerce.number().nonnegative().optional(),
    taxPercent : z.coerce.number().nonnegative().max(100, 'Max : 100').optional(),
    priority : z.coerce.number().int().positive().max(10, 'Max : 10').optional(),
    validFrom : z.coerce.date().optional(),    
    validTo : z.coerce.date().nullable().optional(),
})
.superRefine((data, ctx) => {
    if (
        data.wageType === undefined &&
        data.wageValue === undefined &&
        data.profitType === undefined &&
        data.profitType === undefined &&
        data.taxPercent === undefined &&
        data.priority === undefined &&
        data.validFrom === undefined &&
        data.validTo === undefined
    ) {
        ctx.addIssue({
            code : z.ZodIssueCode.custom,
            message: "At Least One Of The Fields Is Required"
        })
    }

    if (
        data.validFrom !== undefined &&
        data.validTo !== undefined &&
        data.validTo !== null &&
        data.validFrom.getTime() > data.validTo.getTime()
    ) {
        ctx.addIssue({
            code : z.ZodIssueCode.custom,
            path : ['validTo'],
            message : 'Valid To Date Must Be Greater Than Or Equal To Valid From Date'
        })
    }

    if (
        data.wageType !== undefined &&
        data.wageValue !== undefined &&
        data.wageType === 'percent' &&
        data.wageValue > 100
    ) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['wageValue'],
            message:
                'Wage Percent Must Be Between 0 And 100'
        });
    }

    if (
        data.profitType !== undefined &&
        data.profitValue !== undefined &&
        data.profitType === 'percent' &&
        data.profitValue > 100
    ) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['profitValue'],
            message:
                'Profit Percent Must Be Between 0 And 100'
        });
    }
})

export const productVariantPricingIds = z.object({
    productId : z.coerce.number().int().positive(),
    variantId : z.coerce.number().int().positive(),
    pricingId : z.coerce.number().int().positive(),
})

export type CreateVariantPricingDto = z.infer<typeof createVariantPricingSchema>
export type ChangeVariantPricingDto = z.infer<typeof changeVariantPricingSchema>
export type ProductVariantPricingIdsDto = z.infer<typeof productVariantPricingIds>