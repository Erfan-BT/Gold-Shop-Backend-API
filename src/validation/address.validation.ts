import z from "zod"

export const addressSchema = z.object({
    addressLine : z.string().trim().min(3, 'At Least 3 Characters Are Required'),
    city : z.string().trim().min(1, 'At Least A Characters Are Required').max(50),
    postalCode : z.string().trim().min(1, 'At Least A Characters Are Required').max(20),
})

export const addressIdSchema = z.object({
    id : z.coerce.number().int().positive()
})

export type AddressIdDto = z.infer<typeof addressIdSchema>
export type AddressDto = z.infer<typeof addressSchema>