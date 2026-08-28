import express from 'express'
import productController from '../controllers/product.controller.js'
import { validate } from '../middleware/validation.js'
import { productQS, productSlugSchema } from '../validation/product.validation.js'
import { productSlugReviewIdSchema, changeReviewSchema, reviewQS, reviewSchema } from '../validation/review.validation.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = express.Router()

router.get('/', validate({ query : productQS }), productController.getAllProducts)
router.get('/:slug', validate({ params : productSlugSchema }), productController.getProductBySlug)
router.get('/:slug/reviews', validate({ query : reviewQS, params : productSlugSchema }), productController.getProductReviews)
router.post('/:slug/reviews', authMiddleware, validate({ body : reviewSchema, params : productSlugSchema }), productController.addProductReview)
router.patch('/:slug/reviews/:reviewId', authMiddleware, validate({ body : changeReviewSchema, params : productSlugReviewIdSchema }), productController.changeReview)
router.delete('/:slug/reviews/:reviewId', authMiddleware, validate({ params : productSlugReviewIdSchema }), productController.deleteReview)

export default router