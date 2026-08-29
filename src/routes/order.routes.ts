import express from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import orderController from '../controllers/order.controller.js'
import { validate } from '../middleware/validation.js'
import { checkoutSchema, orderNumberSchema, orderQS } from '../validation/order.validation.js'

const router = express.Router()

router.post('/checkout', authMiddleware, validate({ body : checkoutSchema }), orderController.checkout)
router.get('/', authMiddleware, validate({ query : orderQS }), orderController.getUserOrders)
router.get('/:orderNumber', authMiddleware, validate({ params : orderNumberSchema }), orderController.getUserOrder)

export default router