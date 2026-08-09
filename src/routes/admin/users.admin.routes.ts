import express from 'express'
import adminUsersController from '../../controllers/admin/users.admin.controller.js'
import { validate } from '../../middleware/validation.js'
import { userCurrentStatus, userIdSchema, usersQS } from '../../validation/users.validation.js'

const router = express.Router()

router.get('/', validate({ query : usersQS }), adminUsersController.getAllUsers)
router.get("/:userId", validate({ params : userIdSchema }), adminUsersController.getUser)
router.patch("/:userId/active", validate({ params : userIdSchema }), adminUsersController.getUser)

export default router