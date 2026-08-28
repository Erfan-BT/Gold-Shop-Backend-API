import z from "zod";

export const addCartItemSchema = z.object({
    variantId : z.coerce.number().int().positive(),
    quantity : z.coerce.number().int().positive().default(1)
})

export const quantitySchema = z.object({
    quantity : z.coerce.number().int().positive()
})

export type AddCartItemDto = z.infer<typeof addCartItemSchema>
export type QuantityDto = z.infer<typeof quantitySchema>