import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import { CouponsQSDto } from "../../validation/coupon.validation.js";
import couponAdminService from "../../services/admin/coupon.admin.service.js";

class AdminCouponController {
    async getAllCoupons (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const qs = req.validated.query as CouponsQSDto
            const result = await couponAdminService.getAllCoupons(qs)

            res.status(200).json({
                success : true,
                msg : 'Get All Coupons',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new AdminCouponController()