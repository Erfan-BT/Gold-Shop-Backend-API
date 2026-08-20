import { AdminReviewQueryBuilder } from "../../builders/adminReviewQuery.builder.js";
import reviewRepository from "../../repository/review.repository.js";
import { AdminReviewQSDto } from "../../validation/review.validation.js";

class AdminReviewService {
    async getAllReviews (qs : AdminReviewQSDto)
    {
        const options = AdminReviewQueryBuilder.build(qs)
        return await reviewRepository.getAllReviews(options)
    }
}   

export default new AdminReviewService()