import express from 'express'
// Routes
import OrderAdminRoutes from './order.admin.routes.js'
import UsersAdminRoutes from './users.admin.routes.js'
import AddressAdminRoutes from './address.admin.routes.js'
import RoleAdminRoutes from './role.admin.router.js'
import { authMiddleware, roleMiddleware } from '../../middleware/auth.middleware.js'
import { RolesTitle } from '../../types/role.enum.js'

const router = express.Router()

router.use('/orders', authMiddleware, roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN]), OrderAdminRoutes)
router.use('/users', authMiddleware, roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN]), UsersAdminRoutes)
router.use('/addresses', authMiddleware, roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN]), AddressAdminRoutes)
router.use('/roles', authMiddleware, roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN]), RoleAdminRoutes)

export default router