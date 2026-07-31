import express from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validation.js'
import returnController from '../controllers/return.controller.js'
import { returnRequestSchema } from '../validation/return.validation.js'

const router = express.Router()

router.post('/', authMiddleware, validate({ body : returnRequestSchema }), returnController.createReturnRequest)

export default router