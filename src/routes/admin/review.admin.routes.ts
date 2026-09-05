import express from 'express'
import { validate } from '../../middleware/validation.js'
import { adminChangeReviewSchema, adminReviewQS, reviewIdSchema } from '../../validation/review.validation.js'
import adminReviewController from '../../controllers/admin/review.admin.controller.js'
import { roleMiddleware } from '../../middleware/auth.middleware.js'
import { RolesTitle } from '../../types/role.enum.js'
import { reasonSchema } from '../../validation/adminAudit.validation.js'

const router = express.Router()

router.get('/', validate({ query : adminReviewQS }), adminReviewController.getAllReviews)
router.get('/:reviewId', validate({ params : reviewIdSchema }), adminReviewController.getReview)
router.patch('/:reviewId', roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN]), validate({ params : reviewIdSchema, body : adminChangeReviewSchema }), adminReviewController.changeReview)
router.patch('/:reviewId/status', roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN]), validate({ params : reviewIdSchema }), adminReviewController.changeReviewStatus)
router.delete('/:reviewId', roleMiddleware([RolesTitle.OWNER]), validate({ params : reviewIdSchema, body : reasonSchema }), adminReviewController.deleteReview)

export default router