import { NextFunction, Response } from "express"
import { AuthRequest } from "../../middleware/auth.middleware.js"
import { ProductVariantIdsDto } from "../../validation/product.validation.js"
import adminPricingService from "../../services/admin/pricing.admin.service.js"
import { ChangeVariantPricingDto, CreateVariantPricingDto, ProductVariantPricingIdsDto } from "../../validation/pricing.validation.js"

class AdminPricingController {
    async getVariantPricing (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId } = req.validated.params as ProductVariantIdsDto
            const result = await adminPricingService.getVariantPricing(productId, variantId)

            res.status(200).json({
                success : true,
                msg : 'Product Variant Pricing Successfully Found',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async createVariantPricing (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId } = req.validated.params as ProductVariantIdsDto
            const pricingData = req.validated.body as CreateVariantPricingDto
            const adminId = req.user!.userId
            const result = await adminPricingService.createVariantPricing(productId, variantId, pricingData, adminId, req.ip ?? '-0-')

            res.status(201).json({
                success : true,
                msg : 'Product Variant Pricing Created Successfully',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async changeVariantPricing (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId, pricingId } = req.validated.params as ProductVariantPricingIdsDto
            const pricingData = req.validated.body as ChangeVariantPricingDto
            const adminId = req.user!.userId
            const result = await adminPricingService.changeVariantPricing(productId, variantId, pricingId, pricingData, adminId, req.ip ?? '-0-')

            res.status(200).json({
                success : true,
                msg : 'Product Variant Pricing Successfully Changed',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async changeVariantPricingStatus (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId, pricingId } = req.validated.params as ProductVariantPricingIdsDto
            const adminId = req.user!.userId
            const result = await adminPricingService.changeVariantPricingStatus(productId, variantId, pricingId, adminId)

            res.status(200).json({
                success : true,
                msg : 'Variant Pricing Status Changed Successfully',
                data : {
                    newStatus : result
                }
            })
        } catch (error) {
            next(error)
        }
    }

    async deleteVariantPricing (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId, pricingId } = req.validated.params as ProductVariantPricingIdsDto
            const adminId = req.user!.userId
            await adminPricingService.deleteVariantPricing(productId, variantId, pricingId, adminId)

            res.status(200).json({
                success : true,
                msg : 'Product Variant Pricing Successfully Deleted',
                data : null
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new AdminPricingController()