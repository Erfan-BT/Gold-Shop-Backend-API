import express from 'express'
import { validate } from '../../middleware/validation.js'
import { changeCouponSchema, couponIdSchema, couponSchema, couponsQS } from '../../validation/coupon.validation.js'
import adminCouponController from '../../controllers/admin/coupon.admin.controller.js'
import { roleMiddleware } from '../../middleware/auth.middleware.js'
import { RolesTitle } from '../../types/role.enum.js'

const router = express.Router()

router.get('/', validate({ query : couponsQS }), adminCouponController.getAllCoupons)
router.get('/:couponId', validate({ params : couponIdSchema }), adminCouponController.getCoupon)
router.post('/', validate({ body : couponSchema }), adminCouponController.createCoupon)
router.patch('/:couponId', validate({ params : couponIdSchema , body : changeCouponSchema }), adminCouponController.changeCoupon)
router.patch('/:couponId/status', validate({ params : couponIdSchema }), adminCouponController.changeCouponStatus)
router.delete('/:couponId', roleMiddleware([RolesTitle.OWNER]),validate({ params : couponIdSchema }), adminCouponController.deleteCoupon)

export default router