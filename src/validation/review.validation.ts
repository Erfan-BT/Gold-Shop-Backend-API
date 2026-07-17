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

export const changeReviewSchema = z.object({
    rating : z.coerce.number().int().positive().min(0).max(5),
    comment : z.string().min(1)
})

export const changeReviewParams = z.object({
    slug : z.string().min(1).max(200),
    reviewId : z.coerce.number().int().positive()
})

export type ReviewQSDto = z.infer<typeof reviewQS>
export type ReviewDto = z.infer<typeof reviewSchema>
export type ChangeReviewDto = z.infer<typeof changeReviewSchema>
export type ReviewParamsDto = z.infer<typeof changeReviewParams>