import express from 'express'
import authController from '../controllers/auth.controller.js'
import { validate } from '../middleware/validation.js'
import { emailSchema, loginSchema, optSchema, passwordSchema, refreshSchema, registerSchema } from '../validation/auth.validation.js'
import { getAuthLimiter, getEmailLimiter, getRefreshLimiter } from '../middleware/ratelimiter.middleware.js'
import { authMiddleware, notLoginMiddleware } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/register', (req, res, next) => getAuthLimiter()(req, res, next), notLoginMiddleware, validate({ body : registerSchema }), authController.register)
router.post('/login', (req, res, next) => getAuthLimiter()(req, res, next), notLoginMiddleware, validate({ body : loginSchema }), authController.login)

router.post('/logout', authMiddleware, authController.logout)
router.post('/refresh', (req, res, next) => getRefreshLimiter()(req, res, next), authMiddleware, validate({ body : refreshSchema }), authController.refresh)

router.get('/my-account', authMiddleware, authController.myAccount)

router.post('/verify-email', (req, res, next) => getEmailLimiter()(req, res, next), authMiddleware, authController.verifyEmail)
router.get('/verify-email/confirm/:token', validate({ params : optSchema }), authController.verifyEmailConfirm)

router.post('/forget-password', (req, res, next) => getEmailLimiter()(req, res, next), validate({ body : emailSchema }), authController.forgetPassword)
router.post('/reset-password/:token', validate({ params : optSchema, body : passwordSchema }), authController.resetPassword)

export default router