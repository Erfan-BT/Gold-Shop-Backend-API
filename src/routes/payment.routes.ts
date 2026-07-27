import express from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validation.js'
import paymentController from '../controllers/payment.controller.js'
import { callbackSchema, paymentSchema } from '../validation/payment.validation.js'

const router = express.Router()

router.post('/', authMiddleware, validate({ body : paymentSchema }), paymentController.beforePayment)
router.get('/callback', validate({ params : callbackSchema }), paymentController.callback)

export default router