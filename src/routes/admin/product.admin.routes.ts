import express from 'express'
import { validate } from '../../middleware/validation.js'
import { adminProductQS, changeProductSchema, changeVariantSchema, createProductSchema, createVariantSchema, productCategoryIds, productId, productVariantIds } from '../../validation/product.validation.js'
import adminProductController from '../../controllers/admin/product.admin.controller.js'

const router = express.Router()

router.get('/', validate({ query : adminProductQS }), adminProductController.getAllProducts)
router.get('/:productId', validate({ params : productId }), adminProductController.getProduct)
router.post('/', validate({ body : createProductSchema }), adminProductController.createProduct)
router.patch('/:productId', validate({ params : productId, body : changeProductSchema }), adminProductController.changeProduct)
router.patch('/:productId/status', validate({ params : productId }), adminProductController.changeProductStatus)
router.delete('/:productId', validate({ params : productId }), adminProductController.deleteProduct)
// ----- Categories -----
router.get('/:productId/categories', validate({ params : productId }), adminProductController.getProductCategories)
router.post('/:productId/categories/:categoryId', validate({ params : productCategoryIds }), adminProductController.setCategoryForProduct)
router.delete('/:productId/categories/:categoryId', validate({ params : productCategoryIds }), adminProductController.deleteCategoryFromProduct)
// ----- Variants -----
router.get('/:productId/variants', validate({ params : productId }), adminProductController.getProductVariants)
router.get('/:productId/variants/:variantId', validate({ params : productVariantIds }), adminProductController.getVariant)
router.post('/:productId/variants', validate({ params : productId, body : createVariantSchema }), adminProductController.createVariant)
router.patch('/productId/variants/:variantId', validate({ params : productVariantIds, body : changeVariantSchema }), adminProductController.changeVariant)

export default router