import express from 'express'
import authController from '../controllers/auth.controller.js'
import { validate } from '../middleware/validation.js'
import { loginSchema, registerSchema } from '../validation/auth.validation.js'
import { getAuthLimiter } from '../middleware/ratelimiter.middleware.js'

const router = express.Router()

router.post('/register',(req, res, next) => getAuthLimiter()(req, res, next), validate({ body : registerSchema }), authController.register)
router.post('/login',(req, res, next) => getAuthLimiter()(req, res, next), validate({ body : loginSchema }), authController.login)

export default router