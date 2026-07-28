import { NextFunction, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import orderService from "../services/order.service.js";
import { checkoutSchemaDto, orderQSDtp } from "../validation/order.validation.js";

class OrderController {
    async checkout (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
            const { coupon, addressId, shippingMethod } = req.validated.body as checkoutSchemaDto
            const result = await orderService.checkout(userId, addressId, shippingMethod, coupon)

            res.status(200).json({
                success : true,
                msg : 'CheckOut',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async getUserOrders (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
            const qs = req.validated.query as orderQSDtp;
            const result = await orderService.getUserOrders(userId, qs.page, qs.limit)

            res.status(200).json({
                success : true,
                msg : 'Orders',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new OrderController()