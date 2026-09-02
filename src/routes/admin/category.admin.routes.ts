import express from 'express'
import { validate } from '../../middleware/validation.js'
import { categoryIdSchema, categoryQS, categorySchema, changeCategorySchema } from '../../validation/category.vallidation.js'
import adminCategoryController from '../../controllers/admin/category.admin.controller.js'
import { roleMiddleware } from '../../middleware/auth.middleware.js'
import { RolesTitle } from '../../types/role.enum.js'

const router = express.Router()

router.get('/', validate({ query : categoryQS }), adminCategoryController.getAllCategories)
router.post('/', validate({ body : categorySchema }), adminCategoryController.createCategory)
router.patch('/:categoryId', validate({ params : categoryIdSchema , body : changeCategorySchema }), adminCategoryController.changeCategory)
router.patch('/:categoryId/active', validate({ params : categoryIdSchema }), adminCategoryController.changeCategoryStatus)
router.get('/:categoryId/children', validate({ params : categoryIdSchema }), adminCategoryController.getCategoryChildren)
router.delete('/:categoryId', roleMiddleware([RolesTitle.OWNER]), validate({ params : categoryIdSchema }), adminCategoryController.deleteCategory)

export default router