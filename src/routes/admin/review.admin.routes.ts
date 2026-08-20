import express from 'express'
import { validate } from '../../middleware/validation.js'
import { adminChangeReviewSchema, adminReviewQS, reviewIdSchema } from '../../validation/review.validation.js'
import adminReviewController from '../../controllers/admin/review.admin.controller.js'

const router = express.Router()

router.get('/', validate({ query : adminReviewQS }), adminReviewController.getAllReviews)
router.get('/:reviewId', validate({ params : reviewIdSchema }), adminReviewController.getReview)
router.patch('/:reviewId', validate({ params : reviewIdSchema, body : adminChangeReviewSchema }), adminReviewController.changeReview)
router.patch('/:reviewId/status', validate({ params : reviewIdSchema }), adminReviewController.changeReviewStatus)

export default router