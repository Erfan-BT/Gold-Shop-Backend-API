import { NextFunction, Response } from "express"
import { AuthRequest } from "../../middleware/auth.middleware.js"
import { ChangeVariantSchemaDto, CreateVariantSchemaDto, ProductIdDto, ProductVariantIdsDto } from "../../validation/product.validation.js"
import adminVariantService from "../../services/admin/variant.admin.service.js"

class AdminVariantController {
    async getProductVariants (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId } = req.validated.params as ProductIdDto
            const result = await adminVariantService.getProductVariants(productId)

            res.status(200).json({
                success : true,
                msg : 'Get Product Variants',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async getVariant (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId, variantId } = req.validated.params as ProductVariantIdsDto
            const result = await adminVariantService.getVariant(productId, variantId)

            res.status(200).json({
                success : true,
                msg : 'Get Product Variant',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async createVariant (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId } = req.validated.params as ProductIdDto
            const variantData = req.validated.body as CreateVariantSchemaDto
            const result = await adminVariantService.createVariant(productId, variantData)

            res.status(201).json({
                success : true,
                msg : 'Create Product Variant',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async changeVariant (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId } = req.validated.params as ProductVariantIdsDto
            const variantData = req.validated.body as ChangeVariantSchemaDto
            await adminVariantService.changeVariant(productId, variantId, variantData)

            res.status(200).json({
                success : true,
                msg : 'Change Product Variant',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

    async changeVariantStatus (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId } = req.validated.params as ProductVariantIdsDto
            await adminVariantService.changeVariantStatus(productId, variantId)

            res.status(200).json({
                success : true,
                msg : 'Change Product Variant Status',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

    async deleteVariant (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId } = req.validated.params as ProductVariantIdsDto
            const adminId = req.user!.userId
            await adminVariantService.deleteVariant(adminId, productId, variantId)

            res.status(200).json({
                success : true,
                msg : 'Delete Product Variant',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new AdminVariantController()