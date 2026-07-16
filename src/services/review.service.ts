import { ReviewQueryBuilder } from "../builders/reviewQuery.builder.js"
import Review from "../models/review.model.js";
import orderRepository from "../repository/order.repository.js";
import productRepository from "../repository/product.repository.js";
import reviewRepository from "../repository/review.repository.js"
import { BadRequestError, ForbiddenError } from "../utils/appError.js";
import { ReviewDto, ReviewQSDto } from "../validation/review.validation.js"

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
        const variant = await productRepository.getVariant(slug, reviewData.variantId)
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
}

export default new ReviewService()