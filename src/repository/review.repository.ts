import { FindAndCountOptions } from "sequelize";
import Review from "../models/review.model.js";
import { Product, ProductVariant } from "../models/product.model.js";
import { ChangeReviewDto, ReviewDto } from "../validation/review.validation.js";
import User from "../models/user.model.js";

class ReviewRepository {
    async reviewById (reviewId : number, productSlug : string)
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

    async productReviews (slug : string, options: FindAndCountOptions<Review>)
    : Promise<{
        rows: Review[];
        count: number;
    }> {
        const includes = Array.isArray(options.include)
            ? options.include
            : options.include
                ? [options.include]
                : [];
        return await Review.findAndCountAll({
            ...options,
            include : [
                ...includes,
                {
                    model: ProductVariant,
                    as: "variant",
                    required: true,
                    attributes: [],
                    include: [
                        {
                            model: Product,
                            as: "product",
                            required: true,
                            attributes: [],
                            where: {
                                slug,
                                isActive: true
                            }
                        }
                    ]
                }
            ]
        })
    }

    async getUserProductReview (variantId : number, userId : number, isApproved : boolean = true)
    : Promise<Review | null> {
        return await Review.findOne({
            where : {
                userId,
                variantId,
                isApproved
            }
        })
    }

    async createReview (slug : string, userId : number, isVerifiedPurchase : boolean, reviewData : ReviewDto)
    : Promise<Review> {
        return await Review.create({
            userId,
            ...reviewData,
            isApproved : false,
            isVerifiedPurchase
        })
    }

    async changeReview (reviewId : number, reviewDate : ChangeReviewDto)
    : Promise<number> {
        const [rows] = await Review.update(
        {
            comment : reviewDate.comment,
            rating : reviewDate.rating,
            isApproved : false,
            adminReply : null,
            repliedAt : null
        },{
            where : {
                id : reviewId
            }
        })
        return rows
    }

    async deleteReview (reviewId : number)
    : Promise<number> {
        return await Review.destroy({
            where : {
                id : reviewId
            }
        })
    }

    // ----- Admin -----
    async getAllReviews (options : FindAndCountOptions)
    {
        return await Review.findAndCountAll(options)
    }

    async getReview (reviewId : number)
    {
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
                    attributes : ['id', 'name'],
                }
            ]
        })
    }

    async adminChangeReview (reviewId : number, data : Partial<Pick<Review, 'comment' | 'rating' | 'adminReply' | 'repliedAt'>>)
    {
        const [rows] = await Review.update(data, {
            where : {
                id : reviewId
            }
        })
        return rows === 1
    }

    async changeReviewStatus (reviewId : number, currentStatus : boolean)
    {
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
}

export default new ReviewRepository()