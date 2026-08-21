import express from 'express'
import { validate } from '../../middleware/validation.js'
import { adminProductQS, changeProductSchema, changeVariantSchema, createProductSchema, createVariantSchema, productCategoryIds, productId, productVariantIds} from '../../validation/product.validation.js'
import adminProductController from '../../controllers/admin/product.admin.controller.js'
import { adminChangeInventorySchema } from '../../validation/inventory.validation.js'
import adminCategoryController from '../../controllers/admin/category.admin.controller.js'
import adminVariantController from '../../controllers/admin/variant.admin.controller.js'
import adminImageController from '../../controllers/admin/image.admin.controller.js'
import adminPricingController from '../../controllers/admin/pricing.admin.controller.js'
import adminDiscountController from '../../controllers/admin/discount.admin.controller.js'
import adminInventoryController from '../../controllers/admin/inventory.admin.controller.js'
import { imageAltText, imageIdsSchema, productVariantImageIds } from '../../validation/image.validation.js'
import { changeVariantPricing, createVariantPricing, productVariantPricingIds } from '../../validation/pricing.validation.js'
import { changeVariantDiscount, createVariantDiscount, productVariantDiscountIds } from '../../validation/discount.validation.js'
import { roleMiddleware } from '../../middleware/auth.middleware.js'
import { RolesTitle } from '../../types/role.enum.js'

const router = express.Router()

router.get('/', validate({ query : adminProductQS }), adminProductController.getAllProducts)
router.get('/:productId', validate({ params : productId }), adminProductController.getProduct)
router.post('/', validate({ body : createProductSchema }), adminProductController.createProduct)
router.patch('/:productId', validate({ params : productId, body : changeProductSchema }), adminProductController.changeProduct)
router.patch('/:productId/status', validate({ params : productId }), adminProductController.changeProductStatus)
router.delete('/:productId', validate({ params : productId }), adminProductController.deleteProduct)
// ----- Categories -----
router.get('/:productId/categories', validate({ params : productId }), adminCategoryController.getProductCategories)
router.post('/:productId/categories/:categoryId', validate({ params : productCategoryIds }), adminCategoryController.setCategoryForProduct)
router.delete('/:productId/categories/:categoryId', validate({ params : productCategoryIds }), adminCategoryController.deleteCategoryFromProduct)
// ----- Variants -----
router.get('/:productId/variants', validate({ params : productId }), adminVariantController.getProductVariants)
router.get('/:productId/variants/:variantId', validate({ params : productVariantIds }), adminVariantController.getVariant)
router.post('/:productId/variants', validate({ params : productId, body : createVariantSchema }), adminVariantController.createVariant)
router.patch('/:productId/variants/:variantId', validate({ params : productVariantIds, body : changeVariantSchema }), adminVariantController.changeVariant)
router.patch('/:productId/variants/:variantId/status', validate({ params : productVariantIds }), adminVariantController.changeVariantStatus)
router.delete('/:productId/variants/:variantId', validate({ params : productVariantIds }), adminVariantController.deleteVariant)
// ----- Images -----
router.get('/:productId/variants/:variantId/images', validate({ params : productVariantIds }), adminImageController.getVariantImages)
router.post('/:productId/variants/:variantId/images', validate({ params : productVariantIds }), adminImageController.addVariantImages)
router.patch('/:productId/variants/:variantId/images/reorder', validate({ params : productVariantIds, body : imageIdsSchema }), adminImageController.changeVariantImagesOrder)
router.patch('/:productId/variants/:variantId/images/:imageId', validate({ params : productVariantImageIds, body : imageAltText }), adminImageController.changeImageAltText)
router.patch('/:productId/variants/:variantId/images/:imageId/primary', validate({ params : productVariantImageIds }), adminImageController.changeVariantImagePrimary)
router.delete('/:productId/variants/:variantId/images/:imageId', validate({ params : productVariantImageIds }), adminImageController.deleteImage)
// ----- Pricing -----
router.get('/:productId/variants/:variantId/pricing', validate({ params : productVariantIds }), adminPricingController.getVariantPricing)
router.post('/:productId/variants/:variantId/pricing', validate({ params : productVariantIds, body : createVariantPricing }), adminPricingController.createVariantPricing)
router.patch('/:productId/variants/:variantId/pricing/:pricingId', validate({ params : productVariantPricingIds , body : changeVariantPricing }), adminPricingController.changeVariantPricing)
router.patch('/:productId/variants/:variantId/pricing/:pricingId/status', validate({ params : productVariantPricingIds }), adminPricingController.changeVariantPricingStatus)
router.delete('/:productId/variants/:variantId/pricing/:pricingId/', validate({ params : productVariantPricingIds }), adminPricingController.deleteVariantPricing)
// ----- Discount -----
router.get('/:productId/variants/:variantId/discounts', validate({ params : productVariantIds }), adminDiscountController.getVariantDiscounts)
router.post('/:productId/variants/:variantId/discounts', validate({ params : productVariantIds, body : createVariantDiscount }), adminDiscountController.createVariantDiscount)
router.patch('/:productId/variants/:variantId/discounts/:discountId', validate({ params : productVariantDiscountIds, body : changeVariantDiscount }), adminDiscountController.changeVariantDiscount)
router.patch('/:productId/variants/:variantId/discounts/:discountId/status', validate({ params : productVariantDiscountIds }), adminDiscountController.changeVariantDiscountStatus)
router.delete('/:productId/variants/:variantId/discounts/:discountId', validate({ params : productVariantDiscountIds }), adminDiscountController.deleteDiscount)
// ----- Inventory -----
router.get('/:productId/variants/:variantId/inventory', roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN, RolesTitle.INVENTORY]), validate({ params : productVariantIds }), adminInventoryController.getVariantInventory)
router.patch('/:productId/variants/:variantId/inventory', roleMiddleware([RolesTitle.OWNER, RolesTitle.ADMIN, RolesTitle.INVENTORY]), validate({ params : productVariantIds, body : adminChangeInventorySchema }), adminInventoryController.changeVariantInventory)


export default router