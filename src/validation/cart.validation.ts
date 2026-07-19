import z from "zod";

export const addCartItemSchema = z.object({
    variantId : z.coerce.number().int().positive(),
    quantity : z.coerce.number().int().positive().min(1)
})

export type AddCartItemDto = z.infer<typeof addCartItemSchema>