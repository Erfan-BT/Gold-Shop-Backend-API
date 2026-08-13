import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import { CategoryIdDto, CategoryQSDto, CategorySchemaDto } from "../../validation/category.vallidation.js";
import adminCategoryService from "../../services/admin/category.admin.service.js";

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
}

export default new AdminCategoryController()