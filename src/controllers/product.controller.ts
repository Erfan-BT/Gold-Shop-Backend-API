import { NextFunction, Request, Response } from "express";
import { ProductQSDto } from "../validation/product.validation.js";
import productService from "../services/product.service.js";

class ProductController {
    async allProducts (req : Request, res : Response, next : NextFunction) {
        try {
            const qs = req.query as unknown as ProductQSDto;
            const result = await productService.allProducts(qs)

            res.status(200).json({
                success : true,
                msg : 'Products',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new ProductController()