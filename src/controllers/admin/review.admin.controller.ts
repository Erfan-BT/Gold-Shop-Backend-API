import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import { AdminReviewQSDto, ReviewIdSchemaDto } from "../../validation/review.validation.js";
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
}

export default new AdminReviewController()