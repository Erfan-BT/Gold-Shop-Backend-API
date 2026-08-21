import z from "zod";

export const adminChangeInventorySchema = z.object({
    quantity : z.coerce.number().int().nonnegative().optional(),
    minThreshold : z.coerce.number().int().positive().optional()
})
.superRefine((data, ctx) => {
    if (
        data.quantity === undefined &&
        data.minThreshold === undefined
    ) {
        ctx.addIssue({
            code : z.ZodIssueCode.custom,
            message : 'All Params Can Not Empty'
        })
    }
})

export type adminChangeInventorySchemaDto = z.infer<typeof adminChangeInventorySchema>