import { FindAndCountOptions } from "sequelize";
import Review from "../models/review.model.js";
import { Product, ProductVariant } from "../models/product.model.js";

class ReviewRepository {
    async productReviews (slug : string ,options: FindAndCountOptions<Review>)
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
}

export default new ReviewRepository()