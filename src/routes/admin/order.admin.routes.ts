import express from 'express'
import { roleMiddleware } from '../../middleware/auth.middleware.js'
import adminOrderController from '../../controllers/admin/order.admin.controller.js'
import { validate } from '../../middleware/validation.js'
import { orderNumberSchema, ordersAdminQS, trackingCodeSchema } from '../../validation/order.validation.js'
import { RolesTitle } from '../../types/role.enum.js'

const router = express.Router()

router.get('/', roleMiddleware([RolesTitle.ORDERMANAGER]), validate({ query : ordersAdminQS }), adminOrderController.getOrders)
router.get('/:orderNumber', roleMiddleware([RolesTitle.ORDERMANAGER]), validate({ params : orderNumberSchema }), adminOrderController.getOrders)
router.patch('/:orderNumber/process', roleMiddleware([RolesTitle.ORDERMANAGER]), validate({ params : orderNumberSchema }), adminOrderController.setOrderStatusProcess)
router.patch('/:orderNumber/ship', roleMiddleware([RolesTitle.ORDERMANAGER, RolesTitle.INVENTORY]), validate({ params : orderNumberSchema, body : trackingCodeSchema }), adminOrderController.setOrderStatusShipped)
router.patch('/:orderNumber/deliver', roleMiddleware([RolesTitle.ORDERMANAGER]), validate({ params : orderNumberSchema }), adminOrderController.setOrderStatusDelivered)
router.patch('/:orderNumber/cancel', roleMiddleware([RolesTitle.ORDERMANAGER, RolesTitle.INVENTORY]), validate({ params : orderNumberSchema }), adminOrderController.cancelOrder)
router.patch('/:orderNumber/tracking-code', roleMiddleware([RolesTitle.ORDERMANAGER, RolesTitle.INVENTORY]), validate({ params : orderNumberSchema, body : trackingCodeSchema }), adminOrderController.changeTrackingCode)

router.get('/stats', roleMiddleware([RolesTitle.ORDERMANAGER, RolesTitle.INVENTORY, RolesTitle.SUPPORT]), adminOrderController.statsMain)

export default router