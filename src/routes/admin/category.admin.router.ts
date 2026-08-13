import express from 'express'
import { validate } from '../../middleware/validation.js'
import { categoryIdSchema, categoryQS, categorySchema } from '../../validation/category.vallidation.js'
import adminCategoryController from '../../controllers/admin/category.admin.controller.js'

const router = express.Router()

router.get('/', validate({ query : categoryQS }), adminCategoryController.getAllCategories)
router.post('/', validate({ body : categorySchema }), adminCategoryController.createCategory)
router.patch('/:categoryId', validate({ params : categoryIdSchema , body : categorySchema }), adminCategoryController.changeCategory)
router.patch('/:categoryId/active', validate({ params : categoryIdSchema }), adminCategoryController.changeCategoryStatus)

export default router