import express from 'express'
import adminUsersController from '../../controllers/admin/users.admin.controller.js'
import { validate } from '../../middleware/validation.js'
import { adminChangeUserInfo, changeUserRolesSchema, userIdSchema, usersQS } from '../../validation/users.validation.js'
import { passwordSchema } from '../../validation/auth.validation.js'
import { ordersAdminQS } from '../../validation/order.validation.js'

const router = express.Router()

router.get('/', validate({ query : usersQS }), adminUsersController.getAllUsers)
router.get("/:userId", validate({ params : userIdSchema }), adminUsersController.getUser)
router.patch("/:userId", validate({ params : userIdSchema, body : adminChangeUserInfo }), adminUsersController.changeUserInfo)
router.patch("/:userId/active", validate({ params : userIdSchema }), adminUsersController.changeUserStatus)
router.patch('/:userId/change-password', validate({ params : userIdSchema, body : passwordSchema }), adminUsersController.adminResetUserPassword)
router.patch('/:userId/verify-email', validate({ params : userIdSchema }), adminUsersController.adminChangeVerifiedUserEmail)
router.delete('/:userId/revoke-sessions', validate({ params : userIdSchema }), adminUsersController.revokeUserSessions)
router.get('/:userId/orders', validate({ params : userIdSchema, query : ordersAdminQS }), adminUsersController.getUserOrders)
// User-Role
router.get('/:userId/roles', validate({ params : userIdSchema }), adminUsersController.getUserRoles)
router.post('/:userId/roles/:roleId', validate({ params : changeUserRolesSchema }), adminUsersController.addRoleToUser)
router.delete('/:userId/roles/:roleId', validate({ params : changeUserRolesSchema }), adminUsersController.deleteUserRole)
// Stats
router.get('/stats', adminUsersController.stats)

export default router