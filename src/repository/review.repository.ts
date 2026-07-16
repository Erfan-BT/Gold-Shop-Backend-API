import { FindAndCountOptions } from "sequelize";
import Review from "../models/review.model.js";
import { Product, ProductVariant } from "../models/product.model.js";
import { ReviewDto } from "../validation/review.validation.js";

class ReviewRepository {
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
}

export default new ReviewRepository()