import express from 'express'
import { validate } from '../../middleware/validation.js'
import { adminReviewQS, reviewIdSchema } from '../../validation/review.validation.js'
import adminReviewController from '../../controllers/admin/review.admin.controller.js'

const router = express.Router()

router.get('/', validate({ query : adminReviewQS }), adminReviewController.getAllReviews)
router.get('/:reviewId', validate({ params : reviewIdSchema }), adminReviewController.getReview)

export default router