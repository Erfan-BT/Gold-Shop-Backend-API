import z from "zod";
import { ShippingMethod } from "../types/order.enum.js";

export const checkoutSchema = z.object({
    coupon : z.string().min(1).max(50).optional(),
    addressId : z.coerce.number().int().positive(),
    shippingMethod : z.enum(ShippingMethod)
})

export type checkoutSchemaDto = z.infer<typeof checkoutSchema>