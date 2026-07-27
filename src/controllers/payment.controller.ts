import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { CallbackSchemaDto, PaymentSchemaDto } from "../validation/payment.validation.js";
import paymentService from "../services/payment.service.js";

class PaymentController {
    async beforePayment (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const paymentData = req.validated.body as PaymentSchemaDto
            const { userId } = req.user!
            const result = await paymentService.payment(paymentData, userId, req.ip ?? '-0-')
            
            res.status(200).json({
                success : true,
                msg : 'Before Payment',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async callback (req : Request, res : Response, next : NextFunction) {
        try {
            const { Authority, Status} = req.params as CallbackSchemaDto
            const result = await paymentService.callback(Authority, Status, req.ip ?? '-0-')

            res.status(200).json({
                success : true,
                msg : 'Callback',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new PaymentController()