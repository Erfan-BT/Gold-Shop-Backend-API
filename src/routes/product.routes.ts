import express from 'express'
import productController from '../controllers/product.controller.js'
import { validate } from '../middleware/validation.js'
import { productQS, productSlug } from '../validation/product.validation.js'
import { changeReviewParams, reviewQS, reviewSchema } from '../validation/review.validation.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = express.Router()

router.get('/', validate({ query : productQS }), productController.allProducts)
router.get('/:slug', validate({ params : productSlug }), productController.productBySlug)
router.get('/:slug/reviews', validate({ query : reviewQS, params : productSlug }), productController.productReviews)
router.post('/:slug/reviews', authMiddleware, validate({ body : reviewSchema, params : productSlug }), productController.addProductReview)
router.post('/:slug/reviews/:reviewId', authMiddleware, validate({ body : changeReviewParams, params : changeReviewParams }), productController.changeReview)

export default router