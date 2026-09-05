import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import { PaymentIdDto, PaymentQSDto } from "../../validation/payment.validation.js";
import adminPaymentService from "../../services/admin/payment.admin.service.js";

class AdminPaymentController {
    async getAllPayments (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const qs = req.validated.query as PaymentQSDto
            const result = await adminPaymentService.getAllPayments(qs)

            res.status(200).json({
                success : true,
                msg : 'All Payments Successfully Found',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async getPayment (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { paymentId } = req.validated.params as PaymentIdDto
            const result = await adminPaymentService.getPayment(paymentId)

            res.status(200).json({
                success : true,
                msg : 'Payment Successfully Found',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new AdminPaymentController()