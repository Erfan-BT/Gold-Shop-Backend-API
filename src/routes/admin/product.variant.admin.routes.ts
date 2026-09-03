import express from 'express'
import { validate } from '../../middleware/validation.js'
import { changeVariantSchema, createVariantSchema, productIdSchema, productVariantIdsSchema } from '../../validation/product.validation.js'
import adminVariantController from '../../controllers/admin/variant.admin.controller.js'
import { RolesTitle } from '../../types/role.enum.js'
import { roleMiddleware } from '../../middleware/auth.middleware.js'

const router = express.Router()

router.get('/', validate({ params : productIdSchema }), adminVariantController.getProductVariants)
router.get('/:variantId', validate({ params : productVariantIdsSchema }), adminVariantController.getProductVariant)
router.post('/', roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN]), validate({ params : productIdSchema, body : createVariantSchema }), adminVariantController.createVariant)
router.patch('/:variantId', roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN]), validate({ params : productVariantIdsSchema, body : changeVariantSchema }), adminVariantController.changeVariant)
router.patch('/:variantId/status', roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN]), validate({ params : productVariantIdsSchema }), adminVariantController.changeVariantStatus)
router.delete('/:variantId', roleMiddleware([RolesTitle.OWNER]), validate({ params : productVariantIdsSchema }), adminVariantController.deleteVariant)

export default router