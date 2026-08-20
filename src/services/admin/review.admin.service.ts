import { AdminReviewQueryBuilder } from "../../builders/adminReviewQuery.builder.js";
import Review from "../../models/review.model.js";
import reviewRepository from "../../repository/review.repository.js";
import userRepository from "../../repository/user.repository.js";
import { RolesTitle } from "../../types/role.enum.js";
import { ConflictError, ForbiddenError, NotFoundError } from "../../utils/appError.js";
import { AdminChangeReviewSchemaDto, AdminReviewQSDto } from "../../validation/review.validation.js";

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

    async changeReview (reviewId : number, reviewData : AdminChangeReviewSchemaDto)
    {
        // Get Review
        const review = await reviewRepository.getReview(reviewId)
        if (!review)
            throw new NotFoundError(`Review Not Found { ID : ${reviewId} }`)
        
        const data : Partial<Pick<Review, 'comment' | 'rating' | 'adminReply' | 'repliedAt'>> = {}

        if (reviewData.rating !== undefined)
            data.rating = reviewData.rating

        if (reviewData.comment !== undefined)
            data.comment = reviewData.comment

        if (reviewData.adminReply !== undefined) {
            data.adminReply = reviewData.adminReply
            data.repliedAt = new Date()
        }

        // Change
        if (!(await reviewRepository.adminChangeReview(reviewId, data)))
            throw new ConflictError('Review Data Not Changed')
        return
            
    }

    async changeReviewStatus (reviewId : number)
    {
        // Get Review
        const review = await reviewRepository.getReview(reviewId)
        if (!review)
            throw new NotFoundError(`Review Not Found { ID : ${reviewId} }`)

        // Change Status
        if (!(await reviewRepository.changeReviewStatus(reviewId, review.isApproved)))
            throw new ConflictError('Review Status Not Changed')
        return
    }

    async deleteReview (reviewId : number, adminId : number)
    {
        // Get Admin
        const admin = await userRepository.userById(adminId)
        if (!admin)
            throw new NotFoundError(`Admin Not Found { ID : ${adminId} }`)

        const isOwner = admin.roles?.some(userRole => userRole.role?.name === RolesTitle.OWNER) ?? false
        if (!isOwner)
            throw new ForbiddenError('Not Access')

        // Delete
        if (!(await reviewRepository.adminDeleteReview(reviewId)))
            throw new ConflictError('Review Not Deleted')
        return
    }
}   

export default new AdminReviewService()