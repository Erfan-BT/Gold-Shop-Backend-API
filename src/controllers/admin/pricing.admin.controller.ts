import { NextFunction, Response } from "express"
import { AuthRequest } from "../../middleware/auth.middleware.js"
import { ProductVariantIdsDto } from "../../validation/product.validation.js"
import adminPricingService from "../../services/admin/pricing.admin.service.js"
import { ChangeVariantPricing, CreateVariantPricing, ProductVariantPricingIdsDto } from "../../validation/pricing.validation.js"

class AdminPricingController {
    async getVariantPricing (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId } = req.validated.params as ProductVariantIdsDto
            const result = await adminPricingService.getVariantPricing(productId, variantId)

            res.status(200).json({
                success : true,
                msg : 'Get Variant Pricing',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async createVariantPricing (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId } = req.validated.params as ProductVariantIdsDto
            const pricingData = req.validated.body as CreateVariantPricing
            const result = await adminPricingService.createVariantPricing(productId, variantId, pricingData)

            res.status(201).json({
                success : true,
                msg : 'Create Variant Pricing',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async changeVariantPricing (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId, pricingId } = req.validated.params as ProductVariantPricingIdsDto
            const pricingData = req.validated.body as ChangeVariantPricing
            await adminPricingService.changeVariantPricing(productId, variantId, pricingId, pricingData)

            res.status(200).json({
                success : true,
                msg : 'Change Variant Pricing',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

    async changeVariantPricingStatus (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId, pricingId } = req.validated.params as ProductVariantPricingIdsDto
            await adminPricingService.changeVariantPricingStatus(productId, variantId, pricingId)

            res.status(200).json({
                success : true,
                msg : 'Change Variant Pricing Status',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

    async deleteVariantPricing (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId, pricingId } = req.validated.params as ProductVariantPricingIdsDto
            await adminPricingService.deleteVariantPricing(productId, variantId, pricingId)

            res.status(200).json({
                success : true,
                msg : 'Delete Variant Pricing',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new AdminPricingController()