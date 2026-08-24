import express from 'express'
import { validate } from '../../middleware/validation.js'
import adminReturnController from '../../controllers/admin/return.admin.controller.js'
import { adminNoteSchema, returnIdSchema, returnRequestQSSchema, returnTrackingCodeSchema, reviewReturnItemsSchema } from '../../validation/return.validation.js'

const router = express.Router()

router.get('/', validate({ query : returnRequestQSSchema }), adminReturnController.getAllReturnRequests)
router.get('/:returnId', validate({ params : returnIdSchema }), adminReturnController.getReturnRequest)
router.patch('/:returnId/review', validate({ params : returnIdSchema, body : reviewReturnItemsSchema }), adminReturnController.reviewReturnItems)
router.patch('/:returnId/finalize', validate({ params : returnIdSchema, body : adminNoteSchema }), adminReturnController.finalizeReturn)
router.patch('/:returnId/tracking-code', validate({ params : returnIdSchema, body : returnTrackingCodeSchema }), adminReturnController.adminChangeTrackingCode)
router.patch('/:returnId/verify', validate({ params : returnIdSchema }), adminReturnController.verifyReturnedItems)

export default router