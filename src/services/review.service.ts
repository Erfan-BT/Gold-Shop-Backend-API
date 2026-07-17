import { ReviewQueryBuilder } from "../builders/reviewQuery.builder.js"
import Review from "../models/review.model.js";
import orderRepository from "../repository/order.repository.js";
import productRepository from "../repository/product.repository.js";
import reviewRepository from "../repository/review.repository.js"
import { BadRequestError, ForbiddenError, InternalServerError, NotFoundError } from "../utils/appError.js";
import { ChangeReviewDto, ReviewDto, ReviewQSDto } from "../validation/review.validation.js"

class ReviewService {
    async productReviews (slug : string, qs : ReviewQSDto)
    : Promise<{
    rows: Review[];
    count: number;
    }> {
        const options = ReviewQueryBuilder.build(qs)
        return await reviewRepository.productReviews(slug, options)
    }

    async createReview (slug : string, userId : number, reviewData : ReviewDto)
    : Promise<Review> {
        // Check Slug+VariantId
        const variant = await productRepository.getVariantBySlug(slug, reviewData.variantId)
        if (!variant)
            throw new BadRequestError('Product Variant ID Is Wrong')
        // Check User Reviews
        const existsReview = await reviewRepository.getUserProductReview(reviewData.variantId, userId)
        if (existsReview)
            throw new ForbiddenError('You Have A Review For This Product Variant')
        // Chech Verified Purchase
        const isPurchased = await orderRepository.hasUserPurchasedVariant(userId, reviewData.variantId)
        // Add Review
        const review = await reviewRepository.createReview(slug, userId, isPurchased, reviewData)

        return review
    }

    async changeReview (slug : string, userId : number, reviewId : number, reviewData : ChangeReviewDto)
    : Promise<Review> {
        // Get Review
        const review = await reviewRepository.reviewById(reviewId, slug)
        if (!review)
            throw new NotFoundError('Review Not Found')
        if (review.userId !== userId)
            throw new ForbiddenError()
        // Change Review
        const rows = await reviewRepository.changeReview(reviewId, reviewData)
        if (rows === 0)
            throw new InternalServerError("Review Not Updated");
        return (await reviewRepository.reviewById(reviewId, slug)) as Review
    }

    async deleteReview (slug : string, userId : number, reviewId : number)
    : Promise<void> {
        // Get Review
        const review = await reviewRepository.reviewById(reviewId, slug)
        if (!review)
            throw new NotFoundError('Review Not Found')
        if (review.userId !== userId)
            throw new ForbiddenError()
        // Delete Review
        const rows = await reviewRepository.deleteReview(reviewId)
        if (rows === 0)
            throw new InternalServerError("Review Not Deleted");
    }
}

export default new ReviewService()