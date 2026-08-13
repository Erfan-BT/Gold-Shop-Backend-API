import express from 'express'
import adminRoleController from '../../controllers/admin/role.admin.controller.js'

const router = express.Router()

router.get('/', adminRoleController.getAllRoles)

export default router