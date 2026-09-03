import { NextFunction, Response } from "express"
import { AuthRequest } from "../../middleware/auth.middleware.js"
import { ChangeVariantDto, CreateVariantDto, ProductIdDto, ProductVariantIdsDto } from "../../validation/product.validation.js"
import adminVariantService from "../../services/admin/variant.admin.service.js"

class AdminVariantController {
    async getProductVariants (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId } = req.validated.params as ProductIdDto
            const result = await adminVariantService.getProductVariants(productId)

            res.status(200).json({
                success : true,
                msg : 'Product Variants Successfully Found',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async getProductVariant (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId, variantId } = req.validated.params as ProductVariantIdsDto
            const result = await adminVariantService.getProductVariant(productId, variantId)

            res.status(200).json({
                success : true,
                msg : 'Product Variant Successfully Found',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async createVariant (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId } = req.validated.params as ProductIdDto
            const variantData = req.validated.body as CreateVariantDto
            const adminId = req.user!.userId
            const result = await adminVariantService.createVariant(productId, variantData, adminId)

            res.status(201).json({
                success : true,
                msg : 'Product Variant Successfully Created',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async changeVariant (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId } = req.validated.params as ProductVariantIdsDto
            const variantData = req.validated.body as ChangeVariantDto
            const adminId = req.user!.userId
            const result = await adminVariantService.changeVariant(productId, variantId, variantData, adminId)

            res.status(200).json({
                success : true,
                msg : 'Product Variant Successfully Changed',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async changeVariantStatus (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId } = req.validated.params as ProductVariantIdsDto
            const adminId = req.user!.userId
            const result = await adminVariantService.changeVariantStatus(productId, variantId, adminId)

            res.status(200).json({
                success : true,
                msg : 'Product Variant Status Changed Successfully',
                data : {
                    newStatus : result 
                }
            })
        } catch (error) {
            next(error)
        }
    }

    async deleteVariant (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId } = req.validated.params as ProductVariantIdsDto
            const adminId = req.user!.userId
            await adminVariantService.deleteVariant(productId, variantId, adminId, req.ip ?? '-0-')

            res.status(200).json({
                success : true,
                msg : 'Product Variant Successfully Deleted',
                data : null
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new AdminVariantController()