import express from 'express'
import { validate } from '../../middleware/validation.js'
import { productVariantIdsSchema } from '../../validation/product.validation.js'
import { imageAltTextSchema, imageIdsSchema, productVariantImageIdsSchema } from '../../validation/image.validation.js'
import adminImageController from '../../controllers/admin/image.admin.controller.js'
import { uploadProductVariantImages } from '../../middleware/upload.middleware.js'

const router = express.Router()

router.get('/', validate({ params : productVariantIdsSchema }), adminImageController.getVariantImages)
router.post('/', validate({ params : productVariantIdsSchema }), uploadProductVariantImages, adminImageController.addVariantImages)
router.patch('/reorder', validate({ params : productVariantIdsSchema, body : imageIdsSchema }), adminImageController.changeVariantImagesOrder)
router.patch('/:imageId', validate({ params : productVariantImageIdsSchema, body : imageAltTextSchema }), adminImageController.changeImageAltText)
router.post('/:imageId/primary', validate({ params : productVariantImageIdsSchema }), adminImageController.changeVariantImagePrimary)
router.delete('/:imageId', validate({ params : productVariantImageIdsSchema }), adminImageController.deleteImage)

export default router