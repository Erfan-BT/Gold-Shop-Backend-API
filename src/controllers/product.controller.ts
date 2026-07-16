import { NextFunction, Request, Response } from "express";
import { ProductQSDto } from "../validation/product.validation.js";
import productService from "../services/product.service.js";
import reviewService from "../services/review.service.js";
import { ReviewQSDto } from "../validation/review.validation.js";

class ProductController {
    async allProducts (req : Request, res : Response, next : NextFunction) {
        try {
            const qs = req.validated.query as ProductQSDto;
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

    async productBySlug (req : Request, res : Response, next : NextFunction) {
        try {
            const { slug } = req.params
            const result = await productService.productBySlug(String(slug))

            res.status(200).json({
                success : true,
                msg : 'Product',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async productReviews (req : Request, res : Response, next : NextFunction) {
        try {
            const { slug } = req.params
            const qs = req.validated.query as ReviewQSDto
            const result = await reviewService.productReviews(String(slug), qs)

            res.status(200).json({
                success : true,
                msg : 'Reviews',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new ProductController()