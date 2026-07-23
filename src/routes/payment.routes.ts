import express from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validation.js'
import paymentController from '../controllers/payment.controller.js'
import { paymentSchema } from '../validation/payment.validation.js'

const router = express.Router()

router.post('/', authMiddleware, validate({ body : paymentSchema }), paymentController.payment)

export default router