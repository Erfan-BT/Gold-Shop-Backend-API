import express from 'express'
import { validate } from '../../middleware/validation.js'
import { couponIdSchema, couponSchema, couponsQS } from '../../validation/coupon.validation.js'
import adminCouponController from '../../controllers/admin/coupon.admin.controller.js'

const router = express.Router()

router.get('/', validate({ query : couponsQS }), adminCouponController.getAllCoupons)
router.get('/:couponId', validate({ params : couponIdSchema }), adminCouponController.getCoupon)
router.post('/', validate({ body : couponSchema }), adminCouponController.createCoupon)
router.patch('/:couponId', validate({ params : couponIdSchema , body : couponSchema }), adminCouponController.changeCoupon)
router.patch('/:couponId/status', validate({ params : couponIdSchema }), adminCouponController.changeCouponStatus)

export default router