import z from "zod";
import { ShippingMethod } from "../types/order.enum.js";

export const checkoutSchema = z.object({
    coupon : z.string().min(1).max(50).optional(),
    addressId : z.coerce.number().int().positive(),
    shippingMethod : z.enum(ShippingMethod)
})

export const orderQS = z.object({
    page : z.coerce.number().int().positive().min(1).default(1),
    limit : z.coerce.number().int().positive().min(1).max(50).default(20),
})

export const orderNumberSchema = z.object({
    orderNumber : z.string().min(1).max(50)
})

export type checkoutSchemaDto = z.infer<typeof checkoutSchema>
export type orderQSDtp = z.infer<typeof orderQS>