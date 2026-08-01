import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import { OrdersAdminDto } from "../../validation/order.validation.js";
import adminOrderService from "../../services/admin/order.admin.service.js";

class AdminOrderController {
    async getOrders(req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
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
}

export default new AdminOrderController()