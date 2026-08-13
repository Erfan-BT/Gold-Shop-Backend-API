import z from "zod";

export const changePriceSchema = z.object({
    pricePerGram18k : z.coerce.number().int().min(1)
})

export type ChangePriceSchemaDto = z.infer<typeof changePriceSchema>