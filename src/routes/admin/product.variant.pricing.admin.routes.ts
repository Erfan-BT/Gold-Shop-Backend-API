import express from 'express'
import { validate } from '../../middleware/validation.js'
import { productVariantIdsSchema } from '../../validation/product.validation.js'
import adminPricingController from '../../controllers/admin/pricing.admin.controller.js'
import { changeVariantPricing, createVariantPricing, productVariantPricingIds } from '../../validation/pricing.validation.js'

const router = express.Router()

router.get('/', validate({ params : productVariantIdsSchema }), adminPricingController.getVariantPricing)
router.post('/', validate({ params : productVariantIdsSchema, body : createVariantPricing }), adminPricingController.createVariantPricing)
router.patch('/:pricingId', validate({ params : productVariantPricingIds , body : changeVariantPricing }), adminPricingController.changeVariantPricing)
router.patch('/:pricingId/status', validate({ params : productVariantPricingIds }), adminPricingController.changeVariantPricingStatus)
router.delete('/:pricingId/', validate({ params : productVariantPricingIds }), adminPricingController.deleteVariantPricing)

export default router