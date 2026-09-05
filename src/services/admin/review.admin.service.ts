import { AdminReviewQueryBuilder } from "../../builders/adminReviewQuery.builder.js";
import sequelize from "../../configs/sequelize.config.js";
import Review from "../../models/review.model.js";
import adminAuditLogRepository from "../../repository/adminAuditLog.repository.js";
import reviewRepository from "../../repository/review.repository.js";
import userRepository from "../../repository/user.repository.js";
import { AdminAuditAction, AdminAuditEntity } from "../../types/adminAuditLog.enum.js";
import { RolesTitle } from "../../types/role.enum.js";
import { ConflictError, ForbiddenError, NotFoundError } from "../../utils/appError.js";
import { AdminChangeReviewDto, AdminReviewQSDto } from "../../validation/review.validation.js";

class AdminReviewService {
    async getAllReviews (qs : AdminReviewQSDto)
    : Promise<{
        rows: Review[];
        count: number;
    }> {
        // Create Options
        const options = AdminReviewQueryBuilder.build(qs)

        // Get Reviews
        return await reviewRepository.getAllReviews(options)
    }

    async getReview (reviewId : number)
    : Promise<Review> {
        // Get Review
        const review = await reviewRepository.getReview(reviewId)
        if (!review)
            throw new NotFoundError(`Review Not Found { ID : ${reviewId} }`)

        return review
    }

    async changeReview (reviewId : number, reviewData : AdminChangeReviewDto, adminId : number, ipAddress : string)
    : Promise<AdminChangeReviewDto> {
        // Get Review
        const review = await reviewRepository.getReview(reviewId)
        if (!review)
            throw new NotFoundError(`Review Not Found { ID : ${reviewId} }`)

        // Create Data
        const data : Partial<Pick<Review, 'comment' | 'rating' | 'adminReply' | 'repliedAt'>> = {}

        if (reviewData.rating !== undefined && reviewData.rating !== review.rating)
            data.rating = reviewData.rating

        if (reviewData.comment !== undefined && reviewData.comment !== review.comment)
            data.comment = reviewData.comment

        if (reviewData.adminReply !== undefined && reviewData.adminReply !== review.adminReply) {
            data.adminReply = reviewData.adminReply
            data.repliedAt = new Date()
        }

        await sequelize.transaction(async t => {
            // Change Review
            if (!(await reviewRepository.adminChangeReview(reviewId, data, t)))
                throw new ConflictError('Review Not Changed')

            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.UPDATE,
                entityType : AdminAuditEntity.REVIEW,
                entityId : reviewId,
                ipAddress,
                reason : reviewData.reason ?? null,
                oldValues : {
                    rating : review.rating,
                    comment : review.comment,
                    adminReply : review.adminReply,
                    repliedAt : review.repliedAt,
                },
                newValues : data
            }, t)
        })
        
        return data
    }

    async changeReviewStatus (reviewId : number, adminId : number, ipAddress : string)
    : Promise<boolean> {
        // Get Review
        const review = await reviewRepository.getReview(reviewId)
        if (!review)
            throw new NotFoundError(`Review Not Found { ID : ${reviewId} }`)

        await sequelize.transaction(async t => {
            // Change Status
            if (!(await reviewRepository.changeReviewStatus(reviewId, review.isApproved, t)))
                throw new ConflictError('Review Status Not Changed')

            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : review.isApproved ? AdminAuditAction.DEACTIVATE : AdminAuditAction.ACTIVATE,
                entityType : AdminAuditEntity.REVIEW,
                entityId : reviewId,
                ipAddress,
                reason : null,
                oldValues : null,
                newValues : null
            }, t)
        })
        
        return !review.isApproved
    }

    async deleteReview (reviewId : number, reason : string, adminId : number)
    : Promise<void> {
        // Get Review
        const review = await reviewRepository.getReview(reviewId)
        if (!review)
            throw new NotFoundError(`Review Not Found { ID : ${reviewId} }`)
        
        await sequelize.transaction(async t => {
            // Soft Delete Review
            if (!(await reviewRepository.adminDeleteReview(reviewId, t)))
                throw new ConflictError('Review Not Deleted')

            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.DELETE,
                entityType : AdminAuditEntity.REVIEW,
                entityId : reviewId,
                ipAddress : null,
                reason,
                oldValues : null,
                newValues : null
            }, t)
        })
        
        return
    }
}   

export default new AdminReviewService()