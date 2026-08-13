import z from "zod"
import { CouponSort } from "../types/coupon.enum.js";

export const couponSchema = z.object({
    code : z.string().trim().min(3, 'At Least 3 Characters Are Required').max(50),
    type : z.enum(["fixed", "percent"]),
    value : z.coerce.number().int().min(1),
    usageLimit : z.coerce.number().int().min(1),
    expiresAt : z.coerce.date()
})

export const couponIdSchema = z.object({
    couponId : z.coerce.number().int().positive()
})

export const couponsQS = z.object({
    page : z.coerce.number().int().positive().min(1).default(1),
    limit : z.coerce.number().int().positive().min(1).max(50).default(20),
    sort : z.enum(CouponSort).default(CouponSort.NEWEST),

    q : z.string().max(200).optional(),
    type : z.enum(["fixed", "percent"]).optional(),

    minUsageLimit : z.coerce.number().int().min(1).optional(),
    maxUsageLimit : z.coerce.number().int().min(1).optional(),

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
export type CouponSchemaDto = z.infer<typeof couponSchema>
export type CouponsQSDto = z.infer<typeof couponsQS>