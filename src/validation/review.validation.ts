import z from "zod";
import { ReviewSort } from "../types/review.enum.js";

export const reviewQS = z.object({
    page : z.coerce.number().int().positive().min(1).default(1),
    limit : z.coerce.number().int().positive().min(1).max(50).default(20),
    sort : z.enum(ReviewSort).default(ReviewSort.NEWEST),

    rating : z.coerce.number().int().positive().min(0).max(5).optional(),
    verified : z.coerce.boolean().optional()
})

export const reviewSchema = z.object({
    variantId : z.coerce.number().int().positive(),
    rating : z.coerce.number().int().positive().min(0).max(5),
    comment : z.string().min(1)
})

export type ReviewQSDto = z.infer<typeof reviewQS>
export type ReviewDto = z.infer<typeof reviewSchema>