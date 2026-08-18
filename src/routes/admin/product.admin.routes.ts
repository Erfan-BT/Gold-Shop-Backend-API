import express from 'express'
import { validate } from '../../middleware/validation.js'
import { adminProductQS, changeProductSchema, changeVariantSchema, createProductSchema, createVariantSchema, imageAltText, imageIdsSchema, productCategoryIds, productId, productVariantIds, productVariantImageIds } from '../../validation/product.validation.js'
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
router.patch('/:productId/variants/:variantId', validate({ params : productVariantIds, body : changeVariantSchema }), adminProductController.changeVariant)
router.patch('/:productId/variants/:variantId', validate({ params : productVariantIds }), adminProductController.changeVariantStatus)
router.delete('/:productId/variants/:variantId', validate({ params : productVariantIds }), adminProductController.deleteVariant)
// ----- Images -----
router.get('/:productId/variants/:variantId/images', validate({ params : productVariantIds }), adminProductController.getVariantImages)
router.post('/:productId/variants/:variantId/images', validate({ params : productVariantIds }), adminProductController.addVariantImages)
router.patch('/:productId/variants/:variantId/images/:imageId', validate({ params : productVariantImageIds, body : imageAltText }), adminProductController.changeImageAltText)
router.patch('/:productId/variants/:variantId/images/:imageId/primary', validate({ params : productVariantImageIds }), adminProductController.changeVariantImagePrimary)
router.patch('/:productId/variants/:variantId/images/reorder', validate({ params : productVariantIds, body : imageIdsSchema }), adminProductController.changeVariantImagesOrder)

export default router