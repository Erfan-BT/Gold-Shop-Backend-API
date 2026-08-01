import express from 'express'
import { roleMiddleware } from '../../middleware/auth.middleware.js'
import adminOrderController from '../../controllers/admin/order.admin.controller.js'
import { validate } from '../../middleware/validation.js'
import { ordersAdminQS } from '../../validation/order.validation.js'

const router = express.Router()

router.get('/', roleMiddleware(['admin']), validate({ query : ordersAdminQS }), adminOrderController.getOrders)

export default router