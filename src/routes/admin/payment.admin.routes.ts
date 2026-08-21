import express from 'express'
import { validate } from '../../middleware/validation.js'
import { paymentIdSchema, paymentQS } from '../../validation/payment.validation.js'
import adminPaymentController from '../../controllers/admin/payment.admin.controller.js'

const router = express.Router()

router.get('/', validate({ query : paymentQS }), adminPaymentController.getAllPayments)
router.get('/:paymentId', validate({ params : paymentIdSchema }), adminPaymentController.getPayment)

export default router