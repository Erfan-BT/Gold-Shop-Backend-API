import express from 'express'
import { validate } from '../../middleware/validation.js'
import { couponIdSchema, couponsQS } from '../../validation/coupon.validation.js'
import adminCouponController from '../../controllers/admin/coupon.admin.controller.js'

const router = express.Router()

router.get('/', validate({ query : couponsQS }), adminCouponController.getAllCoupons)
router.get('/:couponId', validate({ params : couponIdSchema }), adminCouponController.getCoupon)

export default router