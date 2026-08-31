import express from 'express'
import { roleMiddleware } from '../../middleware/auth.middleware.js'
import adminOrderController from '../../controllers/admin/order.admin.controller.js'
import { validate } from '../../middleware/validation.js'
import { orderNumberSchema, ordersAdminQS, trackingCodeSchema } from '../../validation/order.validation.js'
import { RolesTitle } from '../../types/role.enum.js'

const router = express.Router()

router.get('/', roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN, RolesTitle.ORDERMANAGER, RolesTitle.SUPPORT]), validate({ query : ordersAdminQS }), adminOrderController.getOrders)
router.get('/:orderNumber', roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN, RolesTitle.ORDERMANAGER, RolesTitle.SUPPORT]), validate({ params : orderNumberSchema }), adminOrderController.getOrder)
router.post('/:orderNumber/process', roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN, RolesTitle.ORDERMANAGER, RolesTitle.SUPPORT]), validate({ params : orderNumberSchema }), adminOrderController.setOrderStatusProcess)
router.post('/:orderNumber/ship', roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN, RolesTitle.ORDERMANAGER, RolesTitle.SUPPORT, RolesTitle.INVENTORY]), validate({ params : orderNumberSchema, body : trackingCodeSchema }), adminOrderController.setOrderStatusShipped)
router.post('/:orderNumber/deliver', roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN, RolesTitle.ORDERMANAGER, RolesTitle.SUPPORT]), validate({ params : orderNumberSchema }), adminOrderController.setOrderStatusDelivered)
router.post('/:orderNumber/cancel', roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN, RolesTitle.ORDERMANAGER, RolesTitle.SUPPORT, RolesTitle.INVENTORY]), validate({ params : orderNumberSchema }), adminOrderController.cancelOrder)
router.patch('/:orderNumber/tracking-code', roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN, RolesTitle.ORDERMANAGER, RolesTitle.SUPPORT, RolesTitle.INVENTORY]), validate({ params : orderNumberSchema, body : trackingCodeSchema }), adminOrderController.changeTrackingCode)


export default router