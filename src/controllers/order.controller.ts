import { NextFunction, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import orderService from "../services/order.service.js";
import { CheckoutDto, OrderNumberDto, OrderQSDto } from "../validation/order.validation.js";

class OrderController {
    async checkout (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
            const { coupon, addressId, shippingMethod } = req.validated.body as CheckoutDto
            const result = await orderService.checkout(userId, addressId, shippingMethod, coupon)

            res.status(200).json({
                success : true,
                msg : 'Cart Ceckout Completed Successfully',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async getUserOrders (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
            const qs = req.validated.query as OrderQSDto
            const result = await orderService.getUserOrders(userId, qs.page, qs.limit)

            res.status(200).json({
                success : true,
                msg : 'User Orders Successfully Found',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async getUserOrder (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
            const { orderNumber } = req.validated.params as OrderNumberDto
            const result = await orderService.getUserOrder(userId, orderNumber)

            res.status(200).json({
                success : true,
                msg : 'User Order Successfully Found',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new OrderController()