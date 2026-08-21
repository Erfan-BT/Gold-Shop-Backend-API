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

export const adminReviewQS = z.object({
    page : z.coerce.number().int().positive().min(1).default(1),
    limit : z.coerce.number().int().positive().min(1).max(50).default(20),
    sort : z.enum(ReviewSort).default(ReviewSort.NEWEST),

    q : z.string().trim().min(1).optional(),
    variantId : z.coerce.number().int().positive().optional(),

    minRating : z.coerce.number().nonnegative().optional(),
    maxRating : z.coerce.number().nonnegative().max(5).optional(),

    isApproved : z.coerce.boolean().optional(),
    isVerifiedPurchase : z.coerce.boolean().optional(),
    hasAdminReply : z.coerce.boolean().optional(),
})
.superRefine((data , ctx) => {
    if (
        data.minRating !== undefined &&
        data.maxRating !== undefined &&
        data.minRating > data.maxRating
    ) {
        ctx.addIssue({
            code : z.ZodIssueCode.custom,
            path : ['maxRating'],
            message : 'Max Rating Must Be Greater Than Or Equal To Min Rating'
        })
    }
})

export const adminChangeReviewSchema = z.object({
    rating : z.coerce.number().int().min(0).max(5).optional() ,
    comment : z.string().trim().min(1).optional() ,
    adminReply : z.string().trim().nullable().optional() ,
})
.superRefine ((data, ctx) => {
    if (
        data.rating === undefined &&
        data.comment === undefined &&
        data.adminReply === undefined
    ) {
        ctx.addIssue({
            code : z.ZodIssueCode.custom,
            message : 'All Params Can Not Empty'
        })
    }
})

export const reviewIdSchema = z.object({
    reviewId : z.coerce.number().int().positive()
})

export type ReviewQSDto = z.infer<typeof reviewQS>
export type ReviewDto = z.infer<typeof reviewSchema>
export type ChangeReviewDto = z.infer<typeof changeReviewSchema>
export type ReviewParamsDto = z.infer<typeof changeReviewParams>
export type AdminReviewQSDto = z.infer<typeof adminReviewQS>
export type AdminChangeReviewSchemaDto = z.infer<typeof adminChangeReviewSchema> 
export type ReviewIdSchemaDto = z.infer<typeof reviewIdSchema>