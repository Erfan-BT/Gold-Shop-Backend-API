import express from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validation.js'
import returnController from '../controllers/return.controller.js'
import { cancelReturnReasonSchema, returnIdSchema, returnRequestSchema, returnTrackingCodeSchema } from '../validation/return.validation.js'

const router = express.Router()

router.get('/', authMiddleware, returnController.getUserReturnRequests)
router.get('/:returnId', authMiddleware, validate({ params : returnIdSchema }), returnController.getReturnRequest)
router.post('/', authMiddleware, validate({ body : returnRequestSchema }), returnController.createReturnRequest)
router.patch('/:returnId', validate({ params : returnIdSchema, body : returnTrackingCodeSchema }), returnController.userRegisterTrackingCode)
router.patch('/:returnId/cancel', validate({ params : returnIdSchema, body : cancelReturnReasonSchema }), returnController.cancelReturnRequest)

export default router