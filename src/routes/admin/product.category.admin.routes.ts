import express from 'express'
import adminCategoryController from '../../controllers/admin/category.admin.controller.js'
import { validate } from '../../middleware/validation.js'
import { productIdSchema } from '../../validation/product.validation.js'
import { roleMiddleware } from '../../middleware/auth.middleware.js'
import { RolesTitle } from '../../types/role.enum.js'
import { productCategoryIdsSchema } from '../../validation/category.vallidation.js'

const router = express.Router()

router.get('/', validate({ params : productIdSchema }), adminCategoryController.getProductCategories)
router.post('/:categoryId', roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN]), validate({ params : productCategoryIdsSchema }), adminCategoryController.setCategoryForProduct)
router.delete('/:categoryId', roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN]), validate({ params : productCategoryIdsSchema }), adminCategoryController.deleteCategoryFromProduct)

export default router