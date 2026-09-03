import express from 'express'
import { validate } from '../../middleware/validation.js'
import { adminProductQS, changeProductSchema, createProductSchema, productIdSchema } from '../../validation/product.validation.js'
import adminProductController from '../../controllers/admin/product.admin.controller.js'

import ProductCategoryRoutes from './product.category.admin.routes.js'
import ProductVariantRoutes from './product.variant.admin.routes.js'
import ProductVariantImageRoutes from './product.variant.image.admin.routes.js'
import ProductVariantPricingRoutes from './product.variant.pricing.admin.routes.js'
import ProductVariantDiscountRoutes from './product.variant.discount.admin.routes.js'
import ProductVariantInventoryRoutes from './product.variant.inventory.admin.routes.js'
import { roleMiddleware } from '../../middleware/auth.middleware.js'
import { RolesTitle } from '../../types/role.enum.js'

const router = express.Router()

router.get('/', validate({ query : adminProductQS }), adminProductController.getAllProducts)
router.get('/:productId', validate({ params : productIdSchema }), adminProductController.getProduct)
router.post('/', roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN]), validate({ body : createProductSchema }), adminProductController.createProduct)
router.patch('/:productId', roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN]), validate({ params : productIdSchema, body : changeProductSchema }), adminProductController.changeProduct)
router.patch('/:productId/status', roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN]), validate({ params : productIdSchema }), adminProductController.changeProductStatus)
router.delete('/:productId', roleMiddleware([RolesTitle.OWNER]), validate({ params : productIdSchema }), adminProductController.deleteProduct)

// ----- Categories -----
router.use('/:productId/categories', ProductCategoryRoutes)

// ----- Variants -----
router.use('/:productId/variants', ProductVariantRoutes)

// ----- Images -----
router.use('/:productId/variants/:variantId/images', roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN]), ProductVariantImageRoutes)

// ----- Pricing -----
router.use('/:productId/variants/:variantId/pricing', roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN]), ProductVariantPricingRoutes)

// ----- Discount -----
router.use('/:productId/variants/:variantId/discounts', roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN]), ProductVariantDiscountRoutes)
// ----- Inventory -----
router.use('/:productId/variants/:variantId/inventory', ProductVariantInventoryRoutes)


export default router