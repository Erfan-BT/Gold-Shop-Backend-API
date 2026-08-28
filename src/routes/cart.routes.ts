import express from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import cartController from '../controllers/cart.controller.js'
import { validate } from '../middleware/validation.js'
import { addCartItemSchema, quantitySchema } from '../validation/cart.validation.js'
import { variantIdSchema } from '../validation/product.validation.js'

const router = express.Router()

router.get('/', authMiddleware, cartController.getCart)
router.post('/items', authMiddleware, validate({ body : addCartItemSchema }), cartController.addItemToCart)
router.patch('/items/:variantId', authMiddleware, validate({ params : variantIdSchema, body : quantitySchema }), cartController.changeQuantity)
router.delete('/items/:variantId', authMiddleware, validate({ params : variantIdSchema }), cartController.deleteItemFromCart)
router.delete('/', authMiddleware, cartController.clearCart)

export default router