import z from "zod";
import { PaymentSort, PaymentStatus } from "../types/payment.enum.js";

export const paymentSchema = z.object({
    checkoutToken : z.string().min(1),
})

export const callbackSchema = z.object({
    Authority : z.string().min(1),
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

export type PaymentSchemaDto = z.infer<typeof paymentSchema>
export type CallbackSchemaDto = z.infer<typeof callbackSchema>
export type PaymentQSDto = z.infer<typeof paymentQS>