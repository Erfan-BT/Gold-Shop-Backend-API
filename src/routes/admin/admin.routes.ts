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
import ReviewAdminRoutes from './review.admin.routes.js'
import PaymentAdminRoutes from './payment.admin.routes.js'
import ReturnAdminRoutes from './return.admin.routes.js'
import SettingAdminRoutes from './setting.admin.routes.js'
import { authMiddleware, roleMiddleware } from '../../middleware/auth.middleware.js'
import { RolesTitle } from '../../types/role.enum.js'

const router = express.Router()

router.use('/orders', authMiddleware, OrderAdminRoutes)
router.use('/users', authMiddleware, roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN, RolesTitle.SUPPORT]), UsersAdminRoutes)
router.use('/addresses', authMiddleware, roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN, RolesTitle.SUPPORT]), AddressAdminRoutes)
router.use('/roles', authMiddleware, roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN]), RoleAdminRoutes)
router.use('/categories', authMiddleware, roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN]), CategoryAdminRoutes)
router.use('/coupons', authMiddleware, roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN]), CouponAdminRoutes)
router.use('/gold-prices', authMiddleware, roleMiddleware([RolesTitle.OWNER]), PricesAdminRoutes)
router.use('/products', authMiddleware, roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN, RolesTitle.INVENTORY, RolesTitle.SUPPORT]), ProductAdminRoutes)
router.use('/reviews', authMiddleware, roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN, RolesTitle.SUPPORT]), ReviewAdminRoutes)
router.use('/payments', authMiddleware, roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN, RolesTitle.ORDERMANAGER, RolesTitle.FINANCE]), PaymentAdminRoutes)
router.use('/returns', authMiddleware, roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN]), ReturnAdminRoutes)
router.use('/settings', authMiddleware, roleMiddleware([RolesTitle.OWNER]), SettingAdminRoutes)

export default router