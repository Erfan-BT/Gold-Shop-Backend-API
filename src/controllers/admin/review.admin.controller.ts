import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import { AdminReviewQSDto } from "../../validation/review.validation.js";
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
}

export default new AdminReviewController()