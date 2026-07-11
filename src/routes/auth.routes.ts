import express from 'express'
import authController from '../controllers/auth.controller.js'
import { validate } from '../middleware/validation.js'
import { loginSchema, refreshScema, registerSchema } from '../validation/auth.validation.js'
import { getAuthLimiter, getRefreshLimiter } from '../middleware/ratelimiter.middleware.js'
import { authMiddleware, notLoginMiddleware } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/register', (req, res, next) => getAuthLimiter()(req, res, next), notLoginMiddleware, validate({ body : registerSchema }), authController.register)
router.post('/login', (req, res, next) => getAuthLimiter()(req, res, next), notLoginMiddleware, validate({ body : loginSchema }), authController.login)

router.post('/logout', authMiddleware, authController.logout)
router.post('/refresh', (req, res, next) => getRefreshLimiter()(req, res, next), authMiddleware, validate({ body : refreshScema }), authController.refresh)

export default router