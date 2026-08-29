import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { CallbackDto, PaymentDto } from "../validation/payment.validation.js";
import paymentService from "../services/payment.service.js";

class PaymentController {
    async beforePayment (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const paymentData = req.validated.body as PaymentDto
            const { userId } = req.user!
            const result = await paymentService.beforePayment(paymentData, userId, req.ip ?? '-0-')
            
            res.status(200).json({
                success : true,
                msg : 'Order Has Been Prepared For Payment Successfully',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async callback (req : Request, res : Response, next : NextFunction) {
        try {
            const { Authority, Status } = req.validated.query as CallbackDto
            const result = await paymentService.callback(Authority, Status, req.ip ?? '-0-')

            res.status(200).json({
                success : true,
                msg : 'Bank API Callback',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new PaymentController()