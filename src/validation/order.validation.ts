import z from "zod";
import { OrderPaymentStatus, OrderSort, OrderStatus, ShippingMethod } from "../types/order.enum.js";

export const checkoutSchema = z.object({
    coupon : z.string().trim().min(1, 'At Least A Character Is Required').max(50, 'Max : 50 Characters').optional(),
    addressId : z.coerce.number().int().positive(),
    shippingMethod : z.enum(ShippingMethod)
})

export const orderQS = z.object({
    page : z.coerce.number().int().min(1).default(1),
    limit : z.coerce.number().int().min(1).max(10).default(5),
})

export const orderNumberSchema = z.object({
    orderNumber : z.string().trim().min(1, 'At Least A Character Is Required').max(50, 'Max : 50 Characters')
})

export const trackingCodeSchema = z.object({
    trackingCode : z.string().trim().min(1, 'At Least A Character Is Required').max(100, 'Max : 100 Characters')
})

export const ordersAdminQS = z.object({
    page : z.coerce.number().int().min(1).default(1),
    limit : z.coerce.number().int().min(1).max(50).default(20),
    sort : z.enum(OrderSort).default(OrderSort.NEWEST),

    q : z.string().trim().max(200).optional(),
    userId : z.coerce.number().int().min(1).optional(),

    status : z.enum(OrderStatus).optional(),
    paymentStatus : z.enum(OrderPaymentStatus).optional(),
    shippingMethod : z.enum(ShippingMethod).optional(),

    minPrice : z.coerce.number().nonnegative().optional(),
    maxPrice : z.coerce.number().nonnegative().optional(),

    from : z.coerce.date().optional(),
    to : z.coerce.date().optional(),

    coupon : z.coerce.boolean().optional(),
    showDeleted : z.coerce.boolean().default(false),
})
.superRefine((data, ctx) => {
    if (
        data.minPrice !== undefined &&
        data.maxPrice !== undefined &&
        data.minPrice > data.maxPrice
    ) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["maxPrice"],
            message: "maxPrice Must Be Greater Than Or Equal To MinPrice"
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
})

export type CheckoutDto = z.infer<typeof checkoutSchema>
export type OrderQSDto = z.infer<typeof orderQS>
export type OrdersAdminDto = z.infer<typeof ordersAdminQS>
export type OrderNumberDto = z.infer<typeof orderNumberSchema>
export type TrackingCodeDto = z.infer<typeof trackingCodeSchema>