import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import { AdminProductQSDto, ProductIdDto } from "../../validation/product.validation.js";
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
}

export default new AdminProductController()