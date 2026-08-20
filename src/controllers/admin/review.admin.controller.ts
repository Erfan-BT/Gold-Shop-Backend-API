import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import { AdminChangeReviewSchemaDto, AdminReviewQSDto, ReviewIdSchemaDto } from "../../validation/review.validation.js";
import adminReviewService from "../../services/admin/review.admin.service.js";

class AdminReviewController {
    async getAllReviews (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const qs = req.validated.query as AdminReviewQSDto
            const result = await adminReviewService.getAllReviews(qs)

            res.status(200).json({
                success : true,
                msg : 'Get All Reviews',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async getReview (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { reviewId } = req.validated.params as ReviewIdSchemaDto
            const result = await adminReviewService.getReview(reviewId)

            res.status(200).json({
                success : true,
                msg : 'Get Review',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async changeReview (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { reviewId } = req.validated.params as ReviewIdSchemaDto
            const reviewData = req.validated.body as AdminChangeReviewSchemaDto
            await adminReviewService.changeReview(reviewId, reviewData)

            res.status(200).json({
                success : true,
                msg : 'Change Review',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

    async changeReviewStatus (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { reviewId } = req.validated.params as ReviewIdSchemaDto
            await adminReviewService.changeReviewStatus(reviewId)

            res.status(200).json({
                success : true,
                msg : 'Change Review Status',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

    async deleteReview (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { reviewId } = req.validated.params as ReviewIdSchemaDto
            const adminId = req.user!.userId
            await adminReviewService.deleteReview(reviewId, adminId)

            res.status(200).json({
                success : true,
                msg : 'Delete Review',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

}

export default new AdminReviewController()