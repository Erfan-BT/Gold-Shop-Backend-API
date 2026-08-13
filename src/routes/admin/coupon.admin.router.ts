import express from 'express'
import { validate } from '../../middleware/validation.js'
import { couponsQS } from '../../validation/coupon.validation.js'
import adminCouponController from '../../controllers/admin/coupon.admin.controller.js'

const router = express.Router()

router.get('/', validate({ query : couponsQS }), adminCouponController.getAllCoupons)

export default router