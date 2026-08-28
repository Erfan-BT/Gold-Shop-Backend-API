import { FindAndCountOptions, Includeable, Op, Order, WhereOptions } from "sequelize";
import { ReviewQSDto } from "../validation/review.validation.js";
import { ReviewSort } from "../types/review.enum.js";
import Review from "../models/review.model.js";
import User from "../models/user.model.js";
import { Product, ProductVariant } from "../models/product.model.js";

export class ReviewQueryBuilder {

    static build(qs: ReviewQSDto, productSlug : string): FindAndCountOptions<Review> {
        
        const where = this.buildReviewWhere(qs);

        const include: Includeable[] = [
            {
                model: User,
                as: "user",
                attributes: ["id", "name", 'email']
            },
            {
                model: ProductVariant,
                as: "variant",
                required: true,
                attributes: [
                    'id',
                    'sku'
                ],
                where : {
                    isActive : true
                },
                include: [
                    {
                        model: Product,
                        as: "product",
                        required: true,
                        attributes: [],
                        where: {
                            slug : productSlug,
                            isActive: true
                        }
                    }
                ]
            }
        ];

        return {
            where,
            include,
            attributes : [
                'id',
                'userId',
                'variantId',
                'rating',
                'comment',
                'isVerifiedPurchase',
                'adminReply',
                'repliedAt',
                'createdAt',
            ],
            order: this.buildOrder(qs),
            limit: qs.limit,
            offset: (qs.page - 1) * qs.limit,
            distinct: true,
            subQuery: false
        };
    }

    private static buildReviewWhere(
        qs: ReviewQSDto
    ): WhereOptions<Review> {

        const conditions: WhereOptions<Review>[] = [
            {
                isApproved: true
            }
        ];

        if (qs.rating !== undefined) {
            conditions.push({
                rating : qs.rating
            });

        }

        if (qs.isVerifiedPurchase !== undefined) {
            conditions.push({
                isVerifiedPurchase : qs.isVerifiedPurchase
            });

        }

        return {
            [Op.and]: conditions
        };
    }

    private static buildOrder(
        qs: ReviewQSDto
    ): Order {

        switch (qs.sort) {

            case ReviewSort.NEWEST:
                return [
                    ["createdAt", "DESC"]
                ];

            case ReviewSort.OLDEST:
                return [
                    ["createdAt", "ASC"]
                ];

            case ReviewSort.RATING_ASC:
                return [
                    ["rating", "ASC"]
                ];

            case ReviewSort.RATING_DESC:
                return [
                    ["rating", "DESC"]
                ];

            default:
                return [
                    ["createdAt", "DESC"]
                ];
        }

    }

}