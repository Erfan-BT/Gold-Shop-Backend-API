import express from 'express'
import adminCategoryController from '../../controllers/admin/category.admin.controller.js'
import { validate } from '../../middleware/validation.js'
import { productCategoryIdsSchema, productIdSchema } from '../../validation/product.validation.js'

const router = express.Router()

router.get('/', validate({ params : productIdSchema }), adminCategoryController.getProductCategories)
router.post('/:categoryId', validate({ params : productCategoryIdsSchema }), adminCategoryController.setCategoryForProduct)
router.delete('/:categoryId', validate({ params : productCategoryIdsSchema }), adminCategoryController.deleteCategoryFromProduct)

export default router