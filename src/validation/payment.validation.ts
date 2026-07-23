import z from "zod";
import { ShippingMethod } from "../types/order.enum.js";

export const paymentSchema = z.object({
    checkoutToken : z.string().min(1),
})

export type PaymentSchema = z.infer<typeof paymentSchema>