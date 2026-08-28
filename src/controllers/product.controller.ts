import { NextFunction, Request, Response } from "express";
import { ProductQSDto, ProductSlugDto } from "../validation/product.validation.js";
import productService from "../services/product.service.js";
import reviewService from "../services/review.service.js";
import { ChangeReviewDto, ReviewDto, ProductSlugReviewIdDto, ReviewQSDto } from "../validation/review.validation.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

class ProductController {
    async getAllProducts (req : Request, res : Response, next : NextFunction) {
        try {
            const qs = req.validated.query as ProductQSDto;
            const result = await productService.getAllProducts(qs)

            res.status(200).json({
                success : true,
                msg : 'Products Successfully Found',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async getProductBySlug (req : Request, res : Response, next : NextFunction) {
        try {
            const { slug } = req.validated.params as ProductSlugDto
            const result = await productService.getProductBySlug(slug)

            res.status(200).json({
                success : true,
                msg : 'Product Successfully Found',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async getProductReviews (req : Request, res : Response, next : NextFunction) {
        try {
            const { slug } = req.validated.params as ProductSlugDto
            const qs = req.validated.query as ReviewQSDto
            const result = await reviewService.getProductReviews(slug, qs)

            res.status(200).json({
                success : true,
                msg : 'Product Reviews Successfully Found',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async addProductReview (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { slug } = req.validated.params as ProductSlugDto
            const { userId } = req.user!
            const reviewData = req.validated.body as ReviewDto
            const result = await reviewService.createReview(slug, userId, reviewData)

            res.status(201).json({
                success : true,
                msg : 'Review Created Successfully',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async changeReview (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { slug, reviewId } = req.validated.params as ProductSlugReviewIdDto
            const reviewData = req.validated.body as ChangeReviewDto
            const { userId } = req.user!
            const result = await reviewService.changeReview(slug, userId, reviewId, reviewData)

            res.status(200).json({
                success : true,
                msg : 'Review Changed Successfully',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async deleteReview (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { slug, reviewId } = req.validated.params as ProductSlugReviewIdDto
            const { userId } = req.user!
            await reviewService.deleteReview(slug, userId, reviewId)

            res.status(200).json({
                success : true,
                msg : 'Review Successfully Deleted',
                data : null
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new ProductController()