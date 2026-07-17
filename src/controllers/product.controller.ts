import { NextFunction, Request, Response } from "express";
import { ProductQSDto } from "../validation/product.validation.js";
import productService from "../services/product.service.js";
import reviewService from "../services/review.service.js";
import { ChangeReviewDto, ReviewDto, ReviewParamsDto, ReviewQSDto } from "../validation/review.validation.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

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

    async addProductReview (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { slug } = req.params
            const { userId } = req.user!
            const reviewData : ReviewDto = req.body
            const result = await reviewService.createReview(String(slug), userId, reviewData)

            res.status(201).json({
                success : true,
                msg : 'Create Review',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async changeReview (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { slug, reviewId } = req.validated.params as ReviewParamsDto
            const reviewData = req.validated.body as ChangeReviewDto
            const { userId } = req.user!
            const result = await reviewService.changeReview(slug, userId, reviewId, reviewData)

            res.status(200).json({
                success : true,
                msg : 'Change Review',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async deleteReview (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { slug, reviewId } = req.validated.params as ReviewParamsDto
            const { userId } = req.user!
            await reviewService.deleteReview(slug, userId, reviewId)

            res.status(200).json({
                success : true,
                msg : 'Delete Review',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new ProductController()