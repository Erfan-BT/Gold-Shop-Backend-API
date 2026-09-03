import { NextFunction, Response } from "express"
import { AuthRequest } from "../../middleware/auth.middleware.js"
import { ProductVariantIdsDto } from "../../validation/product.validation.js"
import adminImageService from "../../services/admin/image.admin.service.js"
import { ImageAltTextDto, ImageIdsDto, ProductVariantImageIdsDto } from "../../validation/image.validation.js"

class AdminImageController {
    async getVariantImages (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId } = req.validated.params as ProductVariantIdsDto
            const result = await adminImageService.getVariantImages(productId, variantId)
            
            res.status(200).json({
                success : true,
                msg : 'Product Variant Images Successfully Found',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async addVariantImages (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId } = req.validated.params as ProductVariantIdsDto
            const files : Express.Multer.File[] = Array.isArray(req.files) ? req.files : []
            const adminId = req.user!.userId
            const result = await adminImageService.uploadVariantImages(productId, variantId, files, adminId)
            
            res.status(200).json({
                success : true,
                msg : 'Product Variant Images Successfully Uploaded',
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
            const adminId = req.user!.userId
            await adminImageService.changeImageAltText(productId, variantId, imageId, altText, adminId)
            
            res.status(200).json({
                success : true,
                msg : 'Image Alt Text Changed Successfully',
                data : null
            })
        } catch (error) {
            next(error)
        }
    }

    async changeVariantImagePrimary (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId, imageId } = req.validated.params as ProductVariantImageIdsDto
            const adminId = req.user!.userId
            await adminImageService.changeVariantImagePrimary(productId, variantId, imageId, adminId)
            
            res.status(200).json({
                success : true,
                msg : 'Product Variant Image Seted Primary Successfully',
                data : null
            })
        } catch (error) {
            next(error)
        }
    }

    async changeVariantImagesOrder (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId } = req.validated.params as ProductVariantIdsDto
            const { imageIds } = req.validated.body as ImageIdsDto
            const adminId = req.user!.userId
            await adminImageService.changeVariantImagesOrder(productId, variantId, imageIds, adminId)
            
            res.status(200).json({
                success : true,
                msg : 'Product Variant Images Order Successfully Changed',
                data : null
            })
        } catch (error) {
            next(error)
        }
    }

    async deleteImage (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId, imageId } = req.validated.params as ProductVariantImageIdsDto
            const adminId = req.user!.userId
            await adminImageService.deleteImage(productId, variantId, imageId, adminId)
            
            res.status(200).json({
                success : true,
                msg : 'Product Variant Image Successfully Deleted',
                data : null
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new AdminImageController()