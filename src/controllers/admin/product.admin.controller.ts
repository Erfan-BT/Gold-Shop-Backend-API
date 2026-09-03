import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import { AdminProductQSDto, ChangeProductDto, CreateProductDto, ProductIdDto } from "../../validation/product.validation.js";
import adminProductService from "../../services/admin/product.admin.service.js";

class AdminProductController {
    async getAllProducts (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const qs = req.validated.query as AdminProductQSDto
            const result = await adminProductService.getAllProducts(qs)

            res.status(200).json({
                success : true,
                msg : 'All Products Successfully Found',
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
                msg : 'Product Successfully Found',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async createProduct (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const productData = req.validated.body as CreateProductDto
            const adminId = req.user!.userId
            const result = await adminProductService.createProduct(productData, adminId)

            res.status(201).json({
                success : true,
                msg : 'Product Successfully Created',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async changeProduct (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const productData = req.validated.body as ChangeProductDto
            const { productId } = req.validated.params as ProductIdDto
            const adminId = req.user!.userId
            const result = await adminProductService.changeProduct(productId, productData, adminId)

            res.status(200).json({
                success : true,
                msg : 'Product Changed Successfully',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async changeProductStatus (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId } = req.validated.params as ProductIdDto
            const adminId = req.user!.userId
            const result = await adminProductService.changeProductStatus(productId, adminId)

            res.status(200).json({
                success : true,
                msg : 'Product Status Changed Successfully',
                data : {
                    newStatus : result
                }
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
                msg : 'Product Deleted Successfully',
                data : null
            })
        } catch (error) {
            next(error)
        }
    }

}

export default new AdminProductController()