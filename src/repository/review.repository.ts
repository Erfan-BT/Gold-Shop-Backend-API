import { FindAndCountOptions, Transaction } from "sequelize";
import Review from "../models/review.model.js";
import { Product, ProductVariant } from "../models/product.model.js";
import { ChangeReviewDto, ReviewDto } from "../validation/review.validation.js";
import User from "../models/user.model.js";

class ReviewRepository {
    async getProductReview (reviewId : number, productSlug : string)
    : Promise<Review | null> {
        return await Review.findOne({
            where : {
                id : reviewId,

            },
            include : [
                {
                    model : ProductVariant,
                    as : 'variant',
                    attributes : [],
                    required : true,
                    where : {
                        isActive : true
                    },
                    include : [
                        {
                            model : Product,
                            as : 'product',
                            required : true,
                            where : {
                                slug : productSlug,
                                isActive : true
                            },
                            attributes : []
                        }
                    ]
                }
            ]
        })
    }

    async getProductReviews (options: FindAndCountOptions<Review>)
    : Promise<{
        rows: Review[];
        count: number;
    }> {
        return await Review.findAndCountAll(options)
    }

    async getUserVariantReview (variantId : number, userId : number, isApproved : boolean = true)
    : Promise<Review | null> {
        return await Review.findOne({
            where : {
                userId,
                variantId,
                isApproved
            }
        })
    }

    async createReview (userId : number, isVerifiedPurchase : boolean, reviewData : ReviewDto)
    : Promise<Review> {
        return await Review.create({
            userId,
            ...reviewData,
            isApproved : false,
            isVerifiedPurchase
        })
    }

    async changeReview (reviewId : number, data : Partial<Pick<Review, 'rating' | 'comment'>>)
    : Promise<boolean> {
        const [rows] = await Review.update(
        {
            ...data,
            isApproved : false,
            adminReply : null,
            repliedAt : null,
            createdAt : new Date()
        },{
            where : {
                id : reviewId
            }
        })
        return rows === 1
    }

    async deleteReview (reviewId : number)
    : Promise<boolean> {
        const rows = await Review.destroy({
            where : {
                id : reviewId
            }
        })
        return rows === 1
    }

    // ----- Admin -----
    async getAllReviews (options : FindAndCountOptions)
    : Promise<{
        rows: Review[];
        count: number;
    }> {
        return await Review.findAndCountAll(options)
    }

    async getReview (reviewId : number)
    : Promise<Review | null> {
        return await Review.findOne({
            where : {
                id : reviewId
            },
            attributes : [
                'id',
                'userId',
                'varianId',
                'rating',
                'comment',
                'isApproved',
                'isVerifiedPurchase',
                'adminReply',
                'repliedAt',
                'createdAt'
            ],
            include : [
                {
                    model : User,
                    as : 'user',
                    attributes : ['id', 'name', 'email'],
                },
                {
                    model : ProductVariant,
                    as : 'variant',
                    attributes : [
                        'productId',
                        'weight',
                        'karat',
                        'stoneType',
                        'color',
                        'currentPrice',
                        'isActive',
                        'createdAt',
                    ]
                }
            ]
        })
    }

    async adminChangeReview (reviewId : number, data : Partial<Pick<Review, 'comment' | 'rating' | 'adminReply' | 'repliedAt'>>, transaction : Transaction)
    : Promise<boolean> {
        const [rows] = await Review.update(data, {
            where : {
                id : reviewId
            }, transaction
        })
        return rows === 1
    }

    async changeReviewStatus (reviewId : number, currentStatus : boolean, transaction : Transaction)
    : Promise<boolean> {
        const [rows] = await Review.update({
            isApproved : !currentStatus
        }, {
            where : {
                id : reviewId,
                isApproved : currentStatus
            }
        })
        return rows === 1
    }

    async adminDeleteReview (reviewId : number, transaction : Transaction)
    : Promise<boolean> {
        const rows = await Review.destroy({
            where : {
                id : reviewId
            },
            transaction
        })
        return rows === 1
    }
}

export default new ReviewRepository()