import z from "zod";
import { PaymentSort, PaymentStatus } from "../types/payment.enum.js";

export const paymentSchema = z.object({
    checkoutToken : z.string().trim().min(1, 'At Least A Character Is Required').max(255, 'Max : 255 Characters')
})

export const callbackSchema = z.object({
    Authority : z.string().trim().min(1, 'At Least A Character Is Required').max(255, 'Max : 255 Characters'),
    Status : z.enum(['OK', 'NOK'])
})

export const paymentQS = z.object({
    page : z.coerce.number().int().positive().min(1).default(1),
    limit : z.coerce.number().int().positive().min(1).max(50).default(20),
    sort : z.enum(PaymentSort).default(PaymentSort.NEWEST),

    q : z.string().trim().max(200).optional(),
    orderId : z.coerce.number().int().positive().optional(),

    status : z.enum(PaymentStatus).optional(),

    minPrice : z.coerce.number().nonnegative().optional(),
    maxPrice : z.coerce.number().nonnegative().optional(),
    
    from : z.coerce.date().optional(),
    to : z.coerce.date().optional(),

    hasRefund : z.coerce.boolean().optional(),
})
.superRefine((data, ctx) => {
    if (
        data.from !== undefined &&
        data.to !== undefined &&
        data.from.getTime() > data.to.getTime()
    ) {
        ctx.addIssue({
            code : z.ZodIssueCode.custom,
            path : ['to'],
            message : 'To Date Must Be Greater Than Or Equal To From Date'
        })
    }

    if (
        data.minPrice !== undefined &&
        data.maxPrice !== undefined &&
        data.minPrice > data.maxPrice
    ) {
        ctx.addIssue({
            code : z.ZodIssueCode.custom,
            path : ['maxPrice'],
            message : 'Max Price Must Be Greater Than Or Equal To Min Price'
        })
    }
})

export const paymentIdSchema = z.object({
    paymentId : z.coerce.number().int().positive()
})

export type PaymentDto = z.infer<typeof paymentSchema>
export type CallbackDto = z.infer<typeof callbackSchema>
export type PaymentQSDto = z.infer<typeof paymentQS>
export type PaymentIdDto = z.infer<typeof paymentIdSchema>