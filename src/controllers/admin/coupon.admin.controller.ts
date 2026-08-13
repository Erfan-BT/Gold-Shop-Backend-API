import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import { CouponIdDto, CouponSchemaDto, CouponsQSDto } from "../../validation/coupon.validation.js";
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

    async getCoupon (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { couponId } = req.validated.params as CouponIdDto
            const result = await couponAdminService.getCoupon(couponId)

            res.status(200).json({
                success : true,
                msg : 'Get Coupon',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async createCoupon (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const couponData = req.validated.body as CouponSchemaDto
            const result = await couponAdminService.createCoupon(couponData)

            res.status(200).json({
                success : true,
                msg : 'Craete Coupon',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async changeCoupon (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const couponData = req.validated.body as CouponSchemaDto
            const { couponId } = req.validated.params as CouponIdDto
            await couponAdminService.changeCoupon(couponId, couponData)

            res.status(200).json({
                success : true,
                msg : 'Change Coupon',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

    async changeCouponStatus (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { couponId } = req.validated.params as CouponIdDto
            await couponAdminService.changeCouponStatus(couponId)

            res.status(200).json({
                success : true,
                msg : 'Change Coupon Status',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

    async deleteCoupon (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { couponId } = req.validated.params as CouponIdDto
            const adminId = req.user!.userId
            await couponAdminService.deleteCoupon(couponId, adminId)

            res.status(200).json({
                success : true,
                msg : 'Delete Coupon',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

    async stats (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const result = await couponAdminService.stats()

            res.status(200).json({
                success : true,
                msg : 'Coupon Stats',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new AdminCouponController()