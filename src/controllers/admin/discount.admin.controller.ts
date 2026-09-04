import { NextFunction, Response } from "express"
import { AuthRequest } from "../../middleware/auth.middleware.js"
import { ProductVariantIdsDto } from "../../validation/product.validation.js"
import adminDiscountService from "../../services/admin/discount.admin.service.js"
import { ChangeVariantDiscountDto, CreateVariantDiscountDto, ProductVariantDiscountIdsDto } from "../../validation/discount.validation.js"

class AdminDiscountController {
    async getVariantDiscounts (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId } = req.validated.params as ProductVariantIdsDto
            const result = await adminDiscountService.getVariantDiscounts(productId, variantId)

            res.status(200).json({
                success : true,
                msg : 'Product Variant Discounts Successfully Found',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async createVariantDiscount (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId } = req.validated.params as ProductVariantIdsDto
            const discountData = req.validated.body as CreateVariantDiscountDto
            const adminId = req.user!.userId
            const result = await adminDiscountService.createVariantDiscount(productId, variantId, discountData, adminId, req.ip ?? '-0-')

            res.status(201).json({
                success : true,
                msg : 'Product Variant Discount Created Successfully',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async changeVariantDiscount (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId, discountId } = req.validated.params as ProductVariantDiscountIdsDto
            const discountData = req.validated.body as ChangeVariantDiscountDto
            const adminId = req.user!.userId
            const result = await adminDiscountService.changeVariantDiscount(productId, variantId, discountId, discountData, adminId, req.ip ?? '-0-')

            res.status(200).json({
                success : true,
                msg : 'Product Variant Discount Successfully Changed',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async changeVariantDiscountStatus (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId, discountId } = req.validated.params as ProductVariantDiscountIdsDto
            const adminId = req.user!.userId
            const result = await adminDiscountService.changeVariantDiscountStatus(productId, variantId, discountId, adminId)

            res.status(200).json({
                success : true,
                msg : 'Product Variant Discount Status Changed Successfully',
                data : {
                    newStatus : result
                }
            })
        } catch (error) {
            next(error)
        }
    }

    async deleteDiscount (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId, discountId } = req.validated.params as ProductVariantDiscountIdsDto
            const adminId = req.user!.userId
            await adminDiscountService.deleteDiscount(productId, variantId, discountId, adminId)

            res.status(200).json({
                success : true,
                msg : 'Product Variant Discount Successfully Deleted',
                data : null
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new AdminDiscountController()