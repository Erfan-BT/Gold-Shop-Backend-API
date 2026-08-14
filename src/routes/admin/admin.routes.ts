import express from 'express'
// Routes
import OrderAdminRoutes from './order.admin.routes.js'
import UsersAdminRoutes from './users.admin.routes.js'
import AddressAdminRoutes from './address.admin.routes.js'
import RoleAdminRoutes from './role.admin.routes.js'
import CategoryAdminRoutes from './category.admin.routes.js'
import CouponAdminRoutes from './coupon.admin.routes.js'
import PricesAdminRoutes from './goldPrice.admin.routes.js'
import ProductAdminRoutes from './product.admin.routes.js'
import { authMiddleware, roleMiddleware } from '../../middleware/auth.middleware.js'
import { RolesTitle } from '../../types/role.enum.js'

const router = express.Router()

router.use('/orders', authMiddleware, roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN]), OrderAdminRoutes)
router.use('/users', authMiddleware, roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN]), UsersAdminRoutes)
router.use('/addresses', authMiddleware, roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN]), AddressAdminRoutes)
router.use('/roles', authMiddleware, roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN]), RoleAdminRoutes)
router.use('/categories', authMiddleware, roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN]), CategoryAdminRoutes)
router.use('/coupons', authMiddleware, roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN]), CouponAdminRoutes)
router.use('/gold-prices', authMiddleware, roleMiddleware([RolesTitle.OWNER]), PricesAdminRoutes)
router.use('/products', authMiddleware, roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN]), ProductAdminRoutes)

export default router