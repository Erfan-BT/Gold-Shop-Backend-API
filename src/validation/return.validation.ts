import z from "zod";

export const returnRequestSchema = z.object({
    orderNumber : z.string().trim().min(1).max(50),
    items : z.array(
        z.object({
            orderItemId: z.coerce.number().int().positive(),
            quantity: z.coerce.number().int().positive(),
            reason: z.string().trim().min(3).max(50),
            description: z.string().trim().max(1000).optional(),
        })
    )
    .min(1)
    .superRefine((items, ctx) => {
        const ids = new Set<number>();

        for (const [index, item] of items.entries()) {
            if (ids.has(item.orderItemId)) {
                ctx.addIssue({
                    code : z.ZodIssueCode.custom,
                    message : "Duplicate Order Item",
                    path : [index, "orderItemId"],
                })
            }

            ids.add(item.orderItemId)
        }
    })
})

export type ReturnRequestSchemaDto = z.infer<typeof returnRequestSchema>