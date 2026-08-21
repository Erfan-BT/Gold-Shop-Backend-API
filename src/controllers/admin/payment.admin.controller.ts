import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import { PaymentQSDto } from "../../validation/payment.validation.js";
import adminPaymentService from "../../services/admin/payment.admin.service.js";

class AdminPaymentController {
    async getAllPayments (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const qs = req.validated.query as PaymentQSDto
            const result = await adminPaymentService.getAllPayments(qs)

            res.status(200).json({
                success : true,
                msg : 'Get All Payments',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new AdminPaymentController()