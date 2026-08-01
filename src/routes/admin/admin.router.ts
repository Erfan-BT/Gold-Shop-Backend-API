import express from 'express'
// Routes
import OrderAdminRoutes from './order.admin.routes.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'

const router = express.Router()

router.use('/orders', authMiddleware, OrderAdminRoutes)

export default router