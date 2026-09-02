import z from "zod"
import { CouponSort } from "../types/coupon.enum.js";

export const couponSchema = z.object({
    code : z.string().trim().min(3, 'At Least 3 Characters Are Required').max(50),
    type : z.enum(["fixed", "percent"]),
    value : z.coerce.number().int().positive(),
    usageLimit : z.coerce.number().int().positive(),
    expiresAt : z.coerce.date()
})
.superRefine((data, ctx) => {
    if (
        data.type === "percent" &&
        data.value > 100
    ) {
        ctx.addIssue({
            code : z.ZodIssueCode.custom,
            path : ['value'],
            message : 'Type Is Percentage, Value Can Not Be Greater Than 100'
        })
    }

    if (data.expiresAt.getTime() < new Date().getTime()) {
        ctx.addIssue({
            code : z.ZodIssueCode.custom,
            path : ['expiresAt'],
            message : 'Expiration Time Has Expired'
        })
    }
})

export const changeCouponSchema = z.object({
    code : z.string().trim().min(3, 'At Least 3 Characters Are Required').max(50).optional(),
    type : z.enum(["fixed", "percent"]).optional(),
    value : z.coerce.number().int().positive().optional(),
    usageLimit : z.coerce.number().int().positive().optional(),
    expiresAt : z.coerce.date().optional()
})
.superRefine((data, ctx) => {
    if (
        data.code === undefined &&
        data.type === undefined &&
        data.value === undefined &&
        data.usageLimit === undefined &&
        data.expiresAt === undefined
    ) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "At Least One Of The Fields Is Required"
        })
    }

    if (
        data.value !== undefined &&
        data.type === "percent" &&
        data.value > 100
    ) {
        ctx.addIssue({
            code : z.ZodIssueCode.custom,
            path : ['value'],
            message : 'Type Is Percentage, Value Can Not Be Greater Than 100'
        })
    }

    if (
        data.expiresAt !== undefined &&
        data.expiresAt.getTime() < new Date().getTime()
    ) {
        ctx.addIssue({
            code : z.ZodIssueCode.custom,
            path : ['expiresAt'],
            message : 'Expiration Time Has Expired'
        })
    }
})

export const couponIdSchema = z.object({
    couponId : z.coerce.number().int().positive()
})

export const couponsQS = z.object({
    page : z.coerce.number().int().positive().min(1).default(1),
    limit : z.coerce.number().int().positive().min(1).max(50).default(20),
    sort : z.enum(CouponSort).default(CouponSort.NEWEST),

    q : z.string().max(50).optional(),
    type : z.enum(["fixed", "percent"]).optional(),

    minUsageLimit : z.coerce.number().int().positive().optional(),
    maxUsageLimit : z.coerce.number().int().positive().optional(),

    from : z.coerce.date().optional(),
    to : z.coerce.date().optional(),

    expiresFrom : z.coerce.date().optional(),
    expiresTo : z.coerce.date().optional(),

    isActive : z.coerce.boolean().optional(),
    isExhausted : z.coerce.boolean().optional()
})
.superRefine((data, ctx) => {
    if (
        data.minUsageLimit !== undefined &&
        data.maxUsageLimit !== undefined &&
        data.minUsageLimit > data.maxUsageLimit
    ) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["maxUsageLimit"],
            message: "Max Usage Limit Must Be Greater Than Or Equal To Min Usage Limit"
        });
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
        });
    }

    if (
        data.expiresFrom !== undefined &&
        data.expiresTo !== undefined &&
        data.expiresFrom.getTime() > data.expiresTo.getTime()
    ) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["expiresTo"],
            message: "Expires To Date Must Be Greater Than Or Equal To Expires From Date"
        });
    }
})

export type CouponIdDto = z.infer<typeof couponIdSchema>
export type CouponDto = z.infer<typeof couponSchema>
export type ChangeCouponDto = z.infer<typeof changeCouponSchema>
export type CouponsQSDto = z.infer<typeof couponsQS>