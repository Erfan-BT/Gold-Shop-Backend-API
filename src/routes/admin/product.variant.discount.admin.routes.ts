import express from 'express'
import { validate } from '../../middleware/validation.js'
import { productVariantIdsSchema } from '../../validation/product.validation.js'
import { changeVariantDiscount, createVariantDiscount, productVariantDiscountIds } from '../../validation/discount.validation.js'
import adminDiscountController from '../../controllers/admin/discount.admin.controller.js'

const router = express.Router()

router.get('/', validate({ params : productVariantIdsSchema }), adminDiscountController.getVariantDiscounts)
router.post('/', validate({ params : productVariantIdsSchema, body : createVariantDiscount }), adminDiscountController.createVariantDiscount)
router.patch('/:discountId', validate({ params : productVariantDiscountIds, body : changeVariantDiscount }), adminDiscountController.changeVariantDiscount)
router.patch('/:discountId/status', validate({ params : productVariantDiscountIds }), adminDiscountController.changeVariantDiscountStatus)
router.delete('/:discountId', validate({ params : productVariantDiscountIds }), adminDiscountController.deleteDiscount)

export default router