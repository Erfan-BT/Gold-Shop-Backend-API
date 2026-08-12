import z from "zod"
import { AddressSort } from "../types/address.enum.js";

export const addressSchema = z.object({
    addressLine : z.string().trim().min(3, 'At Least 3 Characters Are Required'),
    city : z.string().trim().min(1, 'At Least A Characters Are Required').max(50),
    postalCode : z.string().trim().min(1, 'At Least A Characters Are Required').max(20),
})

export const addressIdSchema = z.object({
    addressId : z.coerce.number().int().positive()
})

export const addressesQS = z.object({
    page : z.coerce.number().int().positive().min(1).default(1),
    limit : z.coerce.number().int().positive().min(1).max(50).default(20),
    sort : z.enum(AddressSort).default(AddressSort.NEWEST),

    q : z.string().max(200).optional(),
    userId : z.coerce.number().int().min(1).optional(),

    from : z.coerce.date().optional(),
    to : z.coerce.date().optional(),

    isDefault : z.coerce.boolean().optional(),
})
.superRefine((data, ctx) => {
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

export type AddressIdDto = z.infer<typeof addressIdSchema>
export type AddressDto = z.infer<typeof addressSchema>
export type AddressesQSDto = z.infer<typeof addressesQS>