import z from "zod";

export const changePriceSchema = z.object({
    pricePerGram18k : z.coerce.number().int().positive(),
    reason : z.string().trim().min(1).max(200)
})

export type ChangePriceDto = z.infer<typeof changePriceSchema>