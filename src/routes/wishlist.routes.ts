import express from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import wishlistController from '../controllers/wishlist.controller.js'

const router = express.Router()

router.get('/wishlist/', authMiddleware, wishlistController.getWishlist)

export default router