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
            message: "At Least One Of The Fields Is Required"
        })
    }
})

export type AdminChangeInventoryDto = z.infer<typeof adminChangeInventorySchema>