import express from 'express'
import { validate } from '../../middleware/validation.js'
import adminReturnController from '../../controllers/admin/return.admin.controller.js'
import { adminNoteSchema, cancelReturnReasonSchema, returnIdSchema, returnRequestQSSchema, returnTrackingCodeSchema, reviewReturnItemsSchema } from '../../validation/return.validation.js'
import { roleMiddleware } from '../../middleware/auth.middleware.js'
import { RolesTitle } from '../../types/role.enum.js'

const router = express.Router()

router.get('/', validate({ query : returnRequestQSSchema }), adminReturnController.getAllReturnRequests)
router.get('/:returnId', validate({ params : returnIdSchema }), adminReturnController.getReturnRequest)
router.post('/:returnId/review', roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN]), validate({ params : returnIdSchema, body : reviewReturnItemsSchema }), adminReturnController.reviewReturnItems)
router.post('/:returnId/finalize', roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN]), validate({ params : returnIdSchema, body : adminNoteSchema }), adminReturnController.finalizeReturn)
router.patch('/:returnId/tracking-code', roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN]), validate({ params : returnIdSchema, body : returnTrackingCodeSchema }), adminReturnController.adminChangeTrackingCode)
router.post('/:returnId/verify', roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN, RolesTitle.INVENTORY]), validate({ params : returnIdSchema }), adminReturnController.verifyReturnedItems)
router.post('/:returnId/cancel', roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN]), validate({ params : returnIdSchema, body : cancelReturnReasonSchema }), adminReturnController.cancelReturnRequest)

export default router