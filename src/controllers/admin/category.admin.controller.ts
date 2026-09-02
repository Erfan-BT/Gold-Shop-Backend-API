import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import { CategoryIdDto, CategoryQSDto, CategoryDto, ChangeCategoryDto } from "../../validation/category.vallidation.js";
import adminCategoryService from "../../services/admin/category.admin.service.js";
import { ProductCategoryIdsDto, ProductIdDto } from "../../validation/product.validation.js";

class AdminCategoryController {
    async getAllCategories (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const qs = req.validated.query as CategoryQSDto
            const result = await adminCategoryService.getAllCategories(qs)

            res.status(200).json({
                success : true,
                msg : 'All Categories Successfully Found',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async createCategory (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const categoryData = req.validated.body as CategoryDto
            const adminId = req.user!.userId
            const result = await adminCategoryService.createCategory(categoryData, adminId)

            res.status(201).json({
                success : true,
                msg : 'Category Successfully Created',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async changeCategory (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const categoryData = req.validated.body as ChangeCategoryDto
            const { categoryId } = req.validated.params as CategoryIdDto
            const adminId = req.user!.userId
            const result = await adminCategoryService.changeCategory(categoryId, categoryData, adminId)

            res.status(200).json({
                success : true,
                msg : 'Category Changed Successfully',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async changeCategoryStatus (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { categoryId } = req.validated.params as CategoryIdDto
            const adminId = req.user!.userId
            const result = await adminCategoryService.changeCategoryStatus(categoryId, adminId)

            res.status(200).json({
                success : true,
                msg : 'Category Status Changed Succesfully',
                data : {
                    newStatus : result
                }
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
                msg : 'Category Children Successfully Found',
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
                msg : 'Category Successfully Deleted',
                data : null
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