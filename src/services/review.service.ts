import { ReviewQueryBuilder } from "../builders/reviewQuery.builder.js"
import reviewRepository from "../repository/review.repository.js"
import { ReviewQSDto } from "../validation/review.validation.js"

class ReviewService {
    async productReviews (slug : string, qs : ReviewQSDto)
    {
        const options = ReviewQueryBuilder.build(qs)
        return await reviewRepository.productReviews(slug, options)
    }
}

export default new ReviewService()