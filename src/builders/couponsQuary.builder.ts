import {
    FindAndCountOptions,
    IncludeOptions,
    Op,
    Order,
    Sequelize,
    WhereOptions
} from "sequelize";

import { CouponsQSDto } from "../validation/coupon.validation.js";
import { CouponSort } from "../types/coupon.enum.js";
import Coupon from "../models/coupon.model.js";

export class CouponQueryBuilder {

    static build(qs : CouponsQSDto): FindAndCountOptions {

        const where = this.buildCouponWhere(qs);

        return {
            where,
            order: this.buildOrder(qs),
            limit: qs.limit,
            offset: (qs.page - 1) * qs.limit,
        }
    }

    private static buildCouponWhere(
        qs: CouponsQSDto
    ): WhereOptions<Coupon> {

        const conditions: WhereOptions<Coupon>[] = []

        if (qs.q) {
            conditions.push({
                [Op.or]: [
                    {
                        code: {
                            [Op.like]: `%${qs.q}%`
                        }
                    },
                ]
            });
        }

        if (qs.type !== undefined) {
            conditions.push({
                type : qs.type
            })
        }

        const dateCondition: {
            [Op.gte]?: Date;
            [Op.lte]?: Date;
        } = {}

        if (qs.from !== undefined)
            dateCondition[Op.gte] = qs.from

        if (qs.to !== undefined)
            dateCondition[Op.lte] = qs.to

        if (Object.keys(dateCondition).length) {
            conditions.push({
                createdAt : dateCondition
            })
        }

        const expiresDateCondition: {
            [Op.gte]?: Date;
            [Op.lte]?: Date;
        } = {};

        if (qs.expiresFrom !== undefined)
            expiresDateCondition[Op.gte] = qs.expiresFrom

        if (qs.expiresTo !== undefined)
            expiresDateCondition[Op.lte] = qs.expiresTo

        if (Object.keys(expiresDateCondition).length) {
            conditions.push({
                expiresAt : expiresDateCondition
            })
        }

        const usageLimitCondition: {
            [Op.gte]?: number;
            [Op.lte]?: number;
        } = {};

        if (qs.minUsageLimit !== undefined)
            usageLimitCondition[Op.gte] = qs.minUsageLimit;

        if (qs.maxUsageLimit !== undefined)
            usageLimitCondition[Op.lte] = qs.maxUsageLimit;

        if (Object.keys(usageLimitCondition).length) {
            conditions.push({
                usageLimit : usageLimitCondition
            })
        }

        if (qs.isActive !== undefined) {
            conditions.push({
                isActive : qs.isActive
            })
        }

        if (qs.isExhausted !== undefined) {
            conditions.push(
                qs.isExhausted
                    ? Sequelize.literal("usedCount >= usageLimit")
                    : Sequelize.literal("usedCount < usageLimit")
            )
        }

        return {
            [Op.and]: conditions
        };
    }

    private static buildOrder(
        qs: CouponsQSDto
    ): Order {

        switch (qs.sort) {

            case CouponSort.NEWEST:
                return [
                    ["createdAt", "DESC"]
                ];

            case CouponSort.OLDEST:
                return [
                    ["createdAt", "ASC"]
                ];

            case CouponSort.LIMIT_ASC:
                return [
                    ["usageLimit", "ASC"]
                ];

            case CouponSort.LIMIT_DESC:
                return [
                    ["usageLimit", "DESC"]
                ];
            case CouponSort.USED_ASC:
                return [
                    ["usedCount", "ASC"]
                ];

            case CouponSort.USED_DESC:
                return [
                    ["usedCount", "DESC"]
                ];

            default:
                return [
                    ["createdAt", "DESC"]
                ];
        }

    }

}