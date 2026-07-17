import express from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import wishlistController from '../controllers/wishlist.controller.js'
import { validate } from '../middleware/validation.js'
import { variantId } from '../validation/product.validation.js'

const router = express.Router()

router.get('/', authMiddleware, wishlistController.getWishlist)
router.post('/', authMiddleware, validate({ body : variantId }), wishlistController.createWishlist)
router.delete('/:variantId', authMiddleware, validate({ params : variantId }), wishlistController.deleteWishlist)

export default router