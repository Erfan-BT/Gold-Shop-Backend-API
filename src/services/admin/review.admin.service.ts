import { AdminReviewQueryBuilder } from "../../builders/adminReviewQuery.builder.js";
import reviewRepository from "../../repository/review.repository.js";
import { NotFoundError } from "../../utils/appError.js";
import { AdminReviewQSDto } from "../../validation/review.validation.js";

class AdminReviewService {
    async getAllReviews (qs : AdminReviewQSDto)
    {
        const options = AdminReviewQueryBuilder.build(qs)
        return await reviewRepository.getAllReviews(options)
    }

    async getReview (reviewId : number)
    {
        const review = await reviewRepository.getReview(reviewId)
        if (!review)
            throw new NotFoundError(`Review Not Found { ID : ${reviewId} }`)
        return review
    }
}   

export default new AdminReviewService()