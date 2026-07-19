import express from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import cartController from '../controllers/cart.controller.js'
import { validate } from '../middleware/validation.js'
import { addCartItemSchema } from '../validation/cart.validation.js'

const router = express.Router()

router.get('/', authMiddleware, cartController.getCart)
router.post('/items', authMiddleware, validate({ body : addCartItemSchema }), cartController.addItem)

export default router