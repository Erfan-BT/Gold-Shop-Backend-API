import express from 'express'
import { validate } from '../../middleware/validation.js'
import { adminReviewQS } from '../../validation/review.validation.js'
import adminReviewController from '../../controllers/admin/review.admin.controller.js'

const router = express.Router()

router.get('/', validate({ query : adminReviewQS }), adminReviewController.getAllReviews)

export default router