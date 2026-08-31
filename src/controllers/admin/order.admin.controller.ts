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
                msg : 'All Orders Successfully Found',
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
                msg : 'Order Successfully Found',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async setOrderStatusProcess (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { orderNumber } = req.validated.params as OrderNumberDto
            const adminId = req.user!.userId
            await adminOrderService.setOrderStatusProcess(orderNumber, adminId)

            res.status(200).json({
                success : true,
                msg : 'Order Status Changed Successfully : Paid => Processing',
                data : null
            })
        } catch (error) {
            next(error)
        }
    }

    async setOrderStatusShipped (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { orderNumber } = req.validated.params as OrderNumberDto
            const { trackingCode } = req.validated.body as TrackingCodeDto
            const adminId = req.user!.userId

            await adminOrderService.setOrderStatusShipped(orderNumber, trackingCode, adminId)

            res.status(200).json({
                success : true,
                msg : 'Order Status Changed Successfully : Processing => Shipped',
                data : null
            })
        } catch (error) {
            next(error)
        }
    }

    async setOrderStatusDelivered (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { orderNumber } = req.validated.params as OrderNumberDto
            const adminId = req.user!.userId

            await adminOrderService.setOrderStatusDelivered(orderNumber, adminId)

            res.status(200).json({
                success : true,
                msg : 'Order Status Changed Successfully : Shipped => Delivered',
                data : null
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
                msg : 'Order Canceled Successfully',
                data : null
            })
        } catch (error) {
            next(error)
        }
    }

    async changeTrackingCode (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { orderNumber } = req.validated.params as OrderNumberDto
            const { trackingCode } = req.validated.body as TrackingCodeDto
            const adminId = req.user!.userId
            const result = await adminOrderService.changeTrackingCode(orderNumber, trackingCode, adminId)

            res.status(200).json({
                success : true,
                msg : 'Tracking Code Changed Successfully',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new AdminOrderController()