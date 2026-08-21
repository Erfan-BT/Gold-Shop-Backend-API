import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import { CategoryIdDto, CategoryQSDto, CategorySchemaDto } from "../../validation/category.vallidation.js";
import adminCategoryService from "../../services/admin/category.admin.service.js";
import { ProductCategoryIdsDto, ProductIdDto } from "../../validation/product.validation.js";

class AdminCategoryController {
    async getAllCategories (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const qs = req.validated.query as CategoryQSDto
            const result = await adminCategoryService.getAllCategories(qs)

            res.status(200).json({
                success : true,
                msg : 'Categories',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async createCategory (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const categoryData = req.validated.body as CategorySchemaDto
            const result = await adminCategoryService.createCategory(categoryData)

            res.status(200).json({
                success : true,
                msg : 'Create Category',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async changeCategory (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const categoryData = req.validated.body as CategorySchemaDto
            const { categoryId } = req.validated.params as CategoryIdDto
            await adminCategoryService.changeCategory(categoryId, categoryData)

            res.status(200).json({
                success : true,
                msg : 'Change Category',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

    async changeCategoryStatus (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { categoryId } = req.validated.params as CategoryIdDto
            await adminCategoryService.changeCategoryStatus(categoryId)

            res.status(200).json({
                success : true,
                msg : 'Change Category Status',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

    async getCategoryChildren (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { categoryId } = req.validated.params as CategoryIdDto
            const result = await adminCategoryService.getCategoryChildren(categoryId)

            res.status(200).json({
                success : true,
                msg : 'Get Category Children',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async deleteCategory (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { categoryId } = req.validated.params as CategoryIdDto
            const adminId = req.user!.userId
            await adminCategoryService.deleteCategory(categoryId, adminId)

            res.status(200).json({
                success : true,
                msg : 'Delete Category',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

    // Product-Variant Categories
    async getProductCategories (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId } = req.validated.params as ProductIdDto
            const result = await adminCategoryService.getProductCategories(productId)

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
            const result = await adminCategoryService.setCategoryForProduct(productId, categoryId)

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
            await adminCategoryService.deleteCategoryFromProduct(productId, categoryId)

            res.status(200).json({
                success : true,
                msg : 'Delete Category From Product',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new AdminCategoryController()