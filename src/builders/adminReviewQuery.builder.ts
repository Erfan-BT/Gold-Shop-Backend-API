import { FindAndCountOptions, Includeable, Op, Order, WhereOptions } from "sequelize";
import { AdminReviewQSDto } from "../validation/review.validation.js";
import { ReviewSort } from "../types/review.enum.js";
import Review from "../models/review.model.js";
import User from "../models/user.model.js";

export class AdminReviewQueryBuilder {

    static build(qs: AdminReviewQSDto): FindAndCountOptions<Review> {
        
        const where = this.buildReviewWhere(qs);

        const include: Includeable[] = [
            {
                model: User,
                as: "user",
                attributes: ["id", "name"]
            }
        ];

        return {
            where,
            include,
            order: this.buildOrder(qs),
            limit: qs.limit,
            offset: (qs.page - 1) * qs.limit,
            distinct: true,
            subQuery: false,
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
        };
    }

    private static buildReviewWhere(
        qs: AdminReviewQSDto
    ): WhereOptions<Review> {

        const conditions: WhereOptions<Review>[] = []

        if (qs.q) {
            conditions.push({
                [Op.or]: [
                    {
                        comment : {
                            [Op.like]: `%${qs.q}%`
                        }
                    },
                    {
                        adminReply : {
                            [Op.like]: `%${qs.q}%`
                        }
                    },
                ]
            })
        }

        if (qs.variantId !== undefined) {
            conditions.push({
                variantId : qs.variantId
            })
        }

        const ratingCondition: {
            [Op.gte]?: number;
            [Op.lte]?: number;
        } = {};

        if (qs.minRating !== undefined)
            ratingCondition[Op.gte] = qs.minRating;

        if (qs.maxRating !== undefined)
            ratingCondition[Op.lte] = qs.maxRating;

        if (Object.keys(ratingCondition).length) {
            conditions.push({
                rating : ratingCondition
            })
        }

        if (qs.isApproved !== undefined) {
            conditions.push({
                isApproved : qs.isApproved
            });
        }

        if (qs.isVerifiedPurchase !== undefined) {
            conditions.push({
                isVerifiedPurchase : qs.isVerifiedPurchase
            });
        }

        if (qs.hasAdminReply !== undefined) {
            conditions.push({
                adminReply : qs.hasAdminReply
                    ? { [Op.ne] : null }
                    : { [Op.is] : null  }
            });
        }

        return {
            [Op.and]: conditions
        };
    }

    private static buildOrder(
        qs: AdminReviewQSDto
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