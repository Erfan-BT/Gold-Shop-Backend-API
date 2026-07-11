import express from 'express'
import authController from '../controllers/auth.controller.js'
import { validate } from '../middleware/validation.js'
import { registerSchema } from '../validation/auth.validation.js'
import { getAuthLimiter } from '../middleware/ratelimiter.middleware.js'

const router = express.Router()

router.post('/register', getAuthLimiter, validate({ body : registerSchema }), authController.register)

export default router