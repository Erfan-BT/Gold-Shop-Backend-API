import { NextFunction, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { PaymentSchema } from "../validation/payment.validation.js";
import paymentService from "../services/payment.service.js";

class PaymentController {
    async payment (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const paymentData = req.validated.body as PaymentSchema
            const { userId } = req.user!
            const result = await paymentService.payment(paymentData, userId, req.ip ?? '-0-')
            
            res.status(200).json({
                success : true,
                msg : 'Payment',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new PaymentController()