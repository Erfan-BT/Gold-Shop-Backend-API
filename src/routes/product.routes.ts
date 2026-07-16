import express from 'express'
import productController from '../controllers/product.controller.js'
import { validate } from '../middleware/validation.js'
import { productQS, productSlug } from '../validation/product.validation.js'
import { reviewQS } from '../validation/review.validation.js'

const router = express.Router()

router.get('/', validate({ query : productQS }), productController.allProducts)
router.get('/:slug', validate({ params : productSlug }), productController.productBySlug)
router.get('/:slug/reviews', validate({ query : reviewQS, params : productSlug }), productController.productReviews)

export default router