import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import { OrderNumberDto, OrdersAdminDto, TrackingCodeDto } from "../../validation/order.validation.js";
import adminOrderService from "../../services/admin/order.admin.service.js";

class AdminOrderController {
    async getOrders(req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const qs = req.validated.query as OrdersAdminDto
            const result = await adminOrderService.getOrders(qs)

            res.status(200).json({
                success : true,
                msg : 'All Orders',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async getOrder(req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { orderNumber } = req.validated.params as OrderNumberDto
            const result = await adminOrderService.getOrder(orderNumber)

            res.status(200).json({
                success : true,
                msg : 'Order',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async setOrderStatusProcess (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { orderNumber } = req.validated.params as OrderNumberDto
            await adminOrderService.setOrderStatusProcess(orderNumber)

            res.status(200).json({
                success : true,
                msg : 'Change Order Status : Processing',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

    
    async setOrderStatusShipped (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { orderNumber } = req.validated.params as OrderNumberDto
            const { trackingCode } = req.validated.body as TrackingCodeDto
            await adminOrderService.setOrderStatusShipped(orderNumber, trackingCode)

            res.status(200).json({
                success : true,
                msg : 'Change Order Status : Shipped',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

    async setOrderStatusDelivered (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { orderNumber } = req.validated.params as OrderNumberDto
            await adminOrderService.setOrderStatusDelivered(orderNumber)

            res.status(200).json({
                success : true,
                msg : 'Change Order Status : Delivered',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

    async cancelOrder (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { orderNumber } = req.validated.params as OrderNumberDto
            const { reason } = req.validated.body
            const { userId } = req.user!
            await adminOrderService.cancelOrder(orderNumber, reason, userId)

            res.status(200).json({
                success : true,
                msg : 'Cancel Order',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

}

export default new AdminOrderController()