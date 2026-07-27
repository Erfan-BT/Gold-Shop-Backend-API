import z from "zod";

export const paymentSchema = z.object({
    checkoutToken : z.string().min(1),
})

export const callbackSchema = z.object({
    Authority : z.string().min(1),
    Status : z.enum(['OK', 'NOK'])
})

export type PaymentSchemaDto = z.infer<typeof paymentSchema>
export type CallbackSchemaDto = z.infer<typeof callbackSchema>