import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import { AdminProductQSDto, ChangeProductSchemaDto, CreateProductSchemaDto, ProductCategoryIdsDto, ProductIdDto } from "../../validation/product.validation.js";
import adminProductService from "../../services/admin/product.admin.service.js";

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

    // ---------- Categories ----------
    async getProductCategories (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId } = req.validated.params as ProductIdDto
            const result = await adminProductService.getProductCategories(productId)

            res.status(200).json({
                success : true,
                msg : 'Product Categories',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async setCategoryForProduct (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId, categoryId } = req.validated.params as ProductCategoryIdsDto
            const result = await adminProductService.setCategoryForProduct(productId, categoryId)

            res.status(200).json({
                success : true,
                msg : 'Set Category For Product',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async deleteCategoryFromProduct (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId, categoryId } = req.validated.params as ProductCategoryIdsDto
            await adminProductService.deleteCategoryFromProduct(productId, categoryId)

            res.status(200).json({
                success : true,
                msg : 'Delete Category From Product',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

    // ---------- Variants ----------
    async getProductVariants (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId } = req.validated.params as ProductIdDto
            const result = await adminProductService.getProductVariants(productId)

            res.status(200).json({
                success : true,
                msg : 'Get Product Variants',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new AdminProductController()