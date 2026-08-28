import { ReviewQueryBuilder } from "../builders/reviewQuery.builder.js"
import Review from "../models/review.model.js";
import orderRepository from "../repository/order.repository.js";
import productRepository from "../repository/product.repository.js";
import reviewRepository from "../repository/review.repository.js"
import { BadRequestError, ConflictError, ForbiddenError, InternalServerError, NotFoundError } from "../utils/appError.js";
import { ChangeReviewDto, ReviewDto, ReviewQSDto } from "../validation/review.validation.js"

class ReviewService {
    async getProductReviews (slug : string, qs : ReviewQSDto)
    : Promise<{
        rows: Review[];
        count: number;
    }> {
        // Create Options
        const options = ReviewQueryBuilder.build(qs, slug)
        // Get Reviews
        return await reviewRepository.getProductReviews(options)
    }

    async createReview (slug : string, userId : number, reviewData : ReviewDto)
    : Promise<Review> {
        // Check Slug+VariantId
        const variant = await productRepository.getProductVariantBySlug(slug, reviewData.variantId)
        if (!variant)
            throw new NotFoundError(`Product Variant Not Found { Product-Slug : ${slug} , Variant-ID : ${reviewData.variantId} }`)
        // Check User Reviews
        const existsReview = await reviewRepository.getUserVariantReview(reviewData.variantId, userId)
        if (existsReview)
            throw new ForbiddenError('You Have A Review For This Product Variant Already')
        // Chech Verified Purchase
        const isPurchased = await orderRepository.hasUserPurchasedVariant(userId, reviewData.variantId)
        // Create Review
        return await reviewRepository.createReview(userId, isPurchased, reviewData)
    }

    async changeReview (slug : string, userId : number, reviewId : number, reviewData : ChangeReviewDto)
    : Promise<ChangeReviewDto> {
        // Get Review
        const review = await reviewRepository.getProductReview(reviewId, slug)
        if (!review)
            throw new NotFoundError(`Review Not Found { ID : ${reviewId} }`)

        if (review.userId !== userId)
            throw new ForbiddenError('This Review Does Not Belong To You')

        // Data
        const data : Partial<Pick<Review, 'rating' | 'comment'>> = {}

        if (reviewData.rating !== undefined && reviewData.rating !== review.rating)
            data.rating = reviewData.rating

        if (reviewData.comment !== undefined && reviewData.comment !== review.comment)
            data.comment = reviewData.comment

        // Change Review
        if (await reviewRepository.changeReview(reviewId, data))
            throw new ConflictError("Review Not Changed");

        return data
    }

    async deleteReview (slug : string, userId : number, reviewId : number)
    : Promise<void> {
        // Get Review
        const review = await reviewRepository.getProductReview(reviewId, slug)
        if (!review)
            throw new NotFoundError(`Review Not Found { ID : ${reviewId} }`)
        
        if (review.userId !== userId)
            throw new ForbiddenError('This Review Does Not Belong To You')

        // Delete Review
        if (await reviewRepository.deleteReview(reviewId))
            throw new ConflictError("Review Not Deleted")
        return
    }
}

export default new ReviewService()