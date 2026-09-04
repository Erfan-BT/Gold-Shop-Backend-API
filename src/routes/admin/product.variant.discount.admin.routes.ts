import express from 'express'
import { validate } from '../../middleware/validation.js'
import { productVariantIdsSchema } from '../../validation/product.validation.js'
import { changeVariantDiscountSchema, createVariantDiscountSchema, productVariantDiscountIdsSchema } from '../../validation/discount.validation.js'
import adminDiscountController from '../../controllers/admin/discount.admin.controller.js'

const router = express.Router()

router.get('/', validate({ params : productVariantIdsSchema }), adminDiscountController.getVariantDiscounts)
router.post('/', validate({ params : productVariantIdsSchema, body : createVariantDiscountSchema }), adminDiscountController.createVariantDiscount)
router.patch('/:discountId', validate({ params : productVariantDiscountIdsSchema, body : changeVariantDiscountSchema }), adminDiscountController.changeVariantDiscount)
router.patch('/:discountId/status', validate({ params : productVariantDiscountIdsSchema }), adminDiscountController.changeVariantDiscountStatus)
router.delete('/:discountId', validate({ params : productVariantDiscountIdsSchema }), adminDiscountController.deleteDiscount)

export default router