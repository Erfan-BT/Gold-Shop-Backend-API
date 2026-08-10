import express from 'express'
import adminUsersController from '../../controllers/admin/users.admin.controller.js'
import { validate } from '../../middleware/validation.js'
import { userIdSchema, usersQS } from '../../validation/users.validation.js'

const router = express.Router()

router.get('/', validate({ query : usersQS }), adminUsersController.getAllUsers)
router.get("/:userId", validate({ params : userIdSchema }), adminUsersController.getUser)
router.patch("/:userId/active", validate({ params : userIdSchema }), adminUsersController.getUser)
router.get('/:userId/roles', validate({ params : userIdSchema }), adminUsersController.getUserRoles)

export default router