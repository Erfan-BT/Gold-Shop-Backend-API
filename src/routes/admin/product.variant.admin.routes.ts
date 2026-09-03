import express from 'express'
import { validate } from '../../middleware/validation.js'
import { changeVariantSchema, createVariantSchema, productIdSchema, productVariantIdsSchema } from '../../validation/product.validation.js'
import adminVariantController from '../../controllers/admin/variant.admin.controller.js'

const router = express.Router()

router.get('/', validate({ params : productIdSchema }), adminVariantController.getProductVariants)
router.get('/:variantId', validate({ params : productVariantIdsSchema }), adminVariantController.getVariant)
router.post('/', validate({ params : productIdSchema, body : createVariantSchema }), adminVariantController.createVariant)
router.patch('/:variantId', validate({ params : productVariantIdsSchema, body : changeVariantSchema }), adminVariantController.changeVariant)
router.patch('/:variantId/status', validate({ params : productVariantIdsSchema }), adminVariantController.changeVariantStatus)
router.delete('/:variantId', validate({ params : productVariantIdsSchema }), adminVariantController.deleteVariant)

export default router