import express from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import wishlistController from '../controllers/wishlist.controller.js'
import { validate } from '../middleware/validation.js'
import { variantIdSchema } from '../validation/product.validation.js'

const router = express.Router()

router.get('/', authMiddleware, wishlistController.getWishlist)
router.post('/', authMiddleware, validate({ body : variantIdSchema }), wishlistController.addVariantToWishlist)
router.delete('/:variantId', authMiddleware, validate({ params : variantIdSchema }), wishlistController.deleteVariantFromWishlist)

export default router