import express from 'express'
import adminUserController from '../../controllers/admin/user.admin.controller.js'
import { validate } from '../../middleware/validation.js'
import { adminChangeUserInfoSchema, changeUserRolesSchema, userIdSchema, usersQS } from '../../validation/user.validation.js'
import { emailSchema } from '../../validation/auth.validation.js'
import { roleMiddleware } from '../../middleware/auth.middleware.js'
import { RolesTitle } from '../../types/role.enum.js'
import { adminChangeUserPasswordSchema, reasonSchema } from '../../validation/adminAudit.validation.js'

const router = express.Router()

router.get('/', validate({ query : usersQS }), adminUserController.getAllUsers)
router.get("/:userId", validate({ params : userIdSchema }), adminUserController.getUser)
router.patch("/:userId", validate({ params : userIdSchema, body : adminChangeUserInfoSchema }), adminUserController.changeUserInfo)
router.patch("/:userId/email", roleMiddleware([RolesTitle.OWNER]), validate({ params : userIdSchema, body : emailSchema }), adminUserController.changeUserEmail)
router.patch("/:userId/active", validate({ params : userIdSchema, body : reasonSchema }), adminUserController.changeUserStatus)
router.patch('/:userId/change-password', roleMiddleware([RolesTitle.OWNER]), validate({ params : userIdSchema, body : adminChangeUserPasswordSchema }), adminUserController.adminResetUserPassword)
router.patch('/:userId/verify-email', validate({ params : userIdSchema }), adminUserController.adminChangeVerifiedUserEmail)
router.delete('/:userId/revoke-sessions', validate({ params : userIdSchema }), adminUserController.revokeUserSessions)
// User-Role
router.get('/:userId/roles', validate({ params : userIdSchema }), adminUserController.getUserRoles)
router.post('/:userId/roles/:roleId', roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN]), validate({ params : changeUserRolesSchema }), adminUserController.addRoleToUser)
router.delete('/:userId/roles/:roleId', roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN]), validate({ params : changeUserRolesSchema }), adminUserController.deleteUserRole)

export default router