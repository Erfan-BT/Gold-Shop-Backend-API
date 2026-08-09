import express from 'express'
import { roleMiddleware } from '../../middleware/auth.middleware.js'
import adminUsersController from '../../controllers/admin/users.admin.controller.js'
import { validate } from '../../middleware/validation.js'
import { usersQS } from '../../validation/users.validation.js'

const router = express.Router()

router.get('/', validate({ query : usersQS }), adminUsersController.getAllUsers)

export default router