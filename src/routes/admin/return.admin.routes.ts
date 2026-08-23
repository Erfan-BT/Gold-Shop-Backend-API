import express from 'express'
import { validate } from '../../middleware/validation.js'
import adminReturnController from '../../controllers/admin/return.admin.controller.js'
import { returnIdSchema, returnRequestQSSchema, reviewReturnItemsSchema } from '../../validation/return.validation.js'

const router = express.Router()

router.get('/', validate({ query : returnRequestQSSchema }), adminReturnController.getAllReturnRequests)
router.get('/:returnId', validate({ params : returnIdSchema }), adminReturnController.getReturnRequest)
router.patch('/:returnId/review', validate({ params : returnIdSchema, body : reviewReturnItemsSchema }), adminReturnController.reviewReturnItems)

export default router