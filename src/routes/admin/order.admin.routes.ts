import express from 'express'
import { roleMiddleware } from '../../middleware/auth.middleware.js'
import adminOrderController from '../../controllers/admin/order.admin.controller.js'
import { validate } from '../../middleware/validation.js'
import { orderNumberSchema, ordersAdminQS } from '../../validation/order.validation.js'

const router = express.Router()

router.get('/', roleMiddleware(['Admin', 'Owner']), validate({ query : ordersAdminQS }), adminOrderController.getOrders)
router.get('/:orderNumber', roleMiddleware(['Admin', 'Owner']), validate({ params : orderNumberSchema }), adminOrderController.getOrders)
router.patch('/:orderNumber/process', roleMiddleware(['Admin', 'Owner']), validate({ params : orderNumberSchema }), adminOrderController.setOrderStatusProcess)

export default router