import { NextFunction, Response } from "express"
import { AuthRequest } from "../../middleware/auth.middleware.js"
import { ChangeVariantDiscount, CreateVariantDiscount, ProductVariantDiscountIdsDto, ProductVariantIdsDto } from "../../validation/product.validation.js"
import adminDiscountService from "../../services/admin/discount.admin.service.js"

class AdminDiscountController {
    async getVariantDiscounts (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId } = req.validated.params as ProductVariantIdsDto
            const result = await adminDiscountService.getVariantDiscounts(productId, variantId)

            res.status(200).json({
                success : true,
                msg : 'Get Variant Discounts',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async createVariantDiscount (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId } = req.validated.params as ProductVariantIdsDto
            const discountData = req.validated.body as CreateVariantDiscount
            const result = await adminDiscountService.createVariantDiscount(productId, variantId, discountData)

            res.status(201).json({
                success : true,
                msg : 'Create Variant Discount',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async changeVariantDiscount (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId, discountId } = req.validated.params as ProductVariantDiscountIdsDto
            const discountData = req.validated.body as ChangeVariantDiscount
            await adminDiscountService.changeVariantDiscount(productId, variantId, discountId, discountData)

            res.status(200).json({
                success : true,
                msg : 'Change Variant Discount',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

    async changeVariantDiscountStatus (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId, discountId } = req.validated.params as ProductVariantDiscountIdsDto
            await adminDiscountService.changeVariantDiscountStatus(productId, variantId, discountId)

            res.status(200).json({
                success : true,
                msg : 'Change Variant Discount Status',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

    async deleteDiscount (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId, discountId } = req.validated.params as ProductVariantDiscountIdsDto
            await adminDiscountService.deleteDiscount(productId, variantId, discountId)

            res.status(200).json({
                success : true,
                msg : 'Delete Variant Discount',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new AdminDiscountController()