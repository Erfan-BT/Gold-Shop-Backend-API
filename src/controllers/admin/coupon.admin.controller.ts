import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import { CouponIdDto, CouponDto, CouponsQSDto, ChangeCouponDto } from "../../validation/coupon.validation.js";
import couponAdminService from "../../services/admin/coupon.admin.service.js";

class AdminCouponController {
    async getAllCoupons (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const qs = req.validated.query as CouponsQSDto
            const result = await couponAdminService.getAllCoupons(qs)

            res.status(200).json({
                success : true,
                msg : 'All Coupons Successfulyy Found',
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
                msg : 'Coupon Successfully Found',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async createCoupon (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const couponData = req.validated.body as CouponDto
            const adminId = req.user!.userId
            const result = await couponAdminService.createCoupon(couponData, adminId)

            res.status(200).json({
                success : true,
                msg : 'Coupon Successfulyy Created',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async changeCoupon (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const couponData = req.validated.body as ChangeCouponDto
            const { couponId } = req.validated.params as CouponIdDto
            const adminId = req.user!.userId
            const result = await couponAdminService.changeCoupon(couponId, couponData, adminId)

            res.status(200).json({
                success : true,
                msg : 'Coupon Changed Successfully',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async changeCouponStatus (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { couponId } = req.validated.params as CouponIdDto
            const adminId = req.user!.userId
            const result = await couponAdminService.changeCouponStatus(couponId, adminId)

            res.status(200).json({
                success : true,
                msg : 'Coupon Status Successfully Changed',
                data : {
                    newStatus : result
                }
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
                msg : 'Coupon Successfully Deleted',
                data : null
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new AdminCouponController()