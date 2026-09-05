import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import { AdminChangeReviewDto, AdminReviewQSDto, ReviewIdDto } from "../../validation/review.validation.js";
import adminReviewService from "../../services/admin/review.admin.service.js";
import { ReasonDto } from "../../validation/adminAudit.validation.js";

class AdminReviewController {
    async getAllReviews (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const qs = req.validated.query as AdminReviewQSDto
            const result = await adminReviewService.getAllReviews(qs)

            res.status(200).json({
                success : true,
                msg : 'All Reviews Successfully Found',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async getReview (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { reviewId } = req.validated.params as ReviewIdDto
            const result = await adminReviewService.getReview(reviewId)

            res.status(200).json({
                success : true,
                msg : 'Review Successfully Found',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async changeReview (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { reviewId } = req.validated.params as ReviewIdDto
            const reviewData = req.validated.body as AdminChangeReviewDto
            const adminId = req.user!.userId
            const result = await adminReviewService.changeReview(reviewId, reviewData, adminId, req.ip ?? '-0-')

            res.status(200).json({
                success : true,
                msg : 'Review Changed Successfully',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async changeReviewStatus (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { reviewId } = req.validated.params as ReviewIdDto
            const adminId = req.user!.userId
            const result = await adminReviewService.changeReviewStatus(reviewId, adminId, req.ip ?? '-0-')

            res.status(200).json({
                success : true,
                msg : 'Review Status Changed Successfully',
                data : {
                    newStatus : result
                }
            })
        } catch (error) {
            next(error)
        }
    }

    async deleteReview (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { reviewId } = req.validated.params as ReviewIdDto
            const { reason } = req.validated.body as ReasonDto
            const adminId = req.user!.userId
            await adminReviewService.deleteReview(reviewId, reason, adminId)

            res.status(200).json({
                success : true,
                msg : 'Review Deleted Successfully',
                data : null
            })
        } catch (error) {
            next(error)
        }
    }

}

export default new AdminReviewController()