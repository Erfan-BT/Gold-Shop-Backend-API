import { NextFunction, Response } from "express"
import { AuthRequest } from "../../middleware/auth.middleware.js"
import { ProductVariantIdsDto } from "../../validation/product.validation.js"
import adminImageService from "../../services/admin/image.admin.service.js"
import { ImageAltTextDto, ImageIdsSchemaDto, ProductVariantImageIdsDto } from "../../validation/image.validation.js"

class AdminImageController {
    async getVariantImages (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId } = req.validated.params as ProductVariantIdsDto
            const result = await adminImageService.getVariantImages(productId, variantId)
            
            res.status(200).json({
                success : true,
                msg : 'Get Variant Images',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async addVariantImages (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId } = req.validated.params as ProductVariantIdsDto
            const files: Express.Multer.File[] = Array.isArray(req.files) ? req.files : [];
            const result = await adminImageService.addVariantImages(productId, variantId, files)
            
            res.status(201).json({
                success : true,
                msg : 'Add Variant Images',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async changeImageAltText (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId, imageId } = req.validated.params as ProductVariantImageIdsDto
            const { altText } = req.validated.body as ImageAltTextDto
            await adminImageService.changeImageAltText(productId, variantId, imageId, altText)
            
            res.status(200).json({
                success : true,
                msg : 'Change Image Alt Text',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

    async changeVariantImagePrimary (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId, imageId } = req.validated.params as ProductVariantImageIdsDto
            await adminImageService.changeVariantImagePrimary(productId, variantId, imageId)
            
            res.status(200).json({
                success : true,
                msg : 'Change Variant Image Primary',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

    async changeVariantImagesOrder (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId } = req.validated.params as ProductVariantIdsDto
            const { imageIds } = req.validated.body as ImageIdsSchemaDto
            await adminImageService.changeVariantImagesOrder(productId, variantId, imageIds)
            
            res.status(200).json({
                success : true,
                msg : 'Change Variant Images Order',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

    async deleteImage (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId, imageId } = req.validated.params as ProductVariantImageIdsDto
            await adminImageService.deleteImage(productId, variantId, imageId)
            
            res.status(200).json({
                success : true,
                msg : 'Delete Variant Image',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new AdminImageController()