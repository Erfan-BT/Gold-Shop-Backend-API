import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import { AdminProductQSDto, ChangeProductSchemaDto, ChangeVariantDiscount, ChangeVariantPricing, ChangeVariantSchemaDto, CreateProductSchemaDto, CreateVariantDiscount, CreateVariantPricing, CreateVariantSchemaDto, ImageAltTextDto, ImageIdsSchemaDto, ProductCategoryIdsDto, ProductIdDto, ProductVariantDiscountIdsDto, ProductVariantIdsDto, ProductVariantImageIdsDto, ProductVariantPricingIdsDto } from "../../validation/product.validation.js";
import adminProductService from "../../services/admin/product.admin.service.js";
import { adminChangeInventorySchemaDto } from "../../validation/inventory.validation.js";

class AdminProductController {
    async getAllProducts (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const qs = req.validated.query as AdminProductQSDto
            const result = await adminProductService.getAllProducts(qs)

            res.status(200).json({
                success : true,
                msg : 'Get All Products',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async getProduct (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId } = req.validated.params as ProductIdDto
            const result = await adminProductService.getProduct(productId)

            res.status(200).json({
                success : true,
                msg : 'Get Product',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async createProduct (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const productData = req.validated.body as CreateProductSchemaDto
            const result = await adminProductService.createProduct(productData)

            res.status(201).json({
                success : true,
                msg : 'Create Product',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async changeProduct (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const productData = req.validated.body as ChangeProductSchemaDto
            const { productId } = req.validated.params as ProductIdDto
            await adminProductService.changeProduct(productId, productData)

            res.status(200).json({
                success : true,
                msg : 'Change Product',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

    async changeProductStatus (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId } = req.validated.params as ProductIdDto
            const result = await adminProductService.changeProductStatus(productId)

            res.status(200).json({
                success : true,
                msg : 'Change Product Status',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async deleteProduct (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId } = req.validated.params as ProductIdDto
            const adminId = req.user!.userId
            await adminProductService.deleteProduct(productId, adminId)

            res.status(200).json({
                success : true,
                msg : 'Delete Product',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

    // ---------- Discounts ----------
    async getVariantDiscounts (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId } = req.validated.params as ProductVariantIdsDto
            const result = await adminProductService.getVariantDiscounts(productId, variantId)

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
            const result = await adminProductService.createVariantDiscount(productId, variantId, discountData)

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
            await adminProductService.changeVariantDiscount(productId, variantId, discountId, discountData)

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
            await adminProductService.changeVariantDiscountStatus(productId, variantId, discountId)

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
            await adminProductService.deleteDiscount(productId, variantId, discountId)

            res.status(200).json({
                success : true,
                msg : 'Delete Variant Discount',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

    // ---------- Inventory ----------
    async getVariantInventory (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId, variantId } = req.validated.params as ProductVariantIdsDto
            const result = await adminProductService.getVariantInventory(productId, variantId)

            res.status(200).json({
                success : true,
                msg : 'Get Variant Inventory',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async changeVariantInventory (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId, variantId } = req.validated.params as ProductVariantIdsDto
            const inventoryData = req.validated.body as adminChangeInventorySchemaDto
            const result = await adminProductService.changeVariantInventory(productId, variantId, inventoryData)

            res.status(200).json({
                success : true,
                msg : 'Change Variant Inventory',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

}

export default new AdminProductController()