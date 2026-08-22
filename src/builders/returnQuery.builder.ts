import {
    FindAndCountOptions,
    IncludeOptions,
    Op,
    Order,
    WhereOptions
} from "sequelize";

import { ReturnRequestQSDto } from "../validation/return.validation.js";
import { ReturnItem, ReturnRequest } from "../models/return.model.js";
import User from "../models/user.model.js";
import { Order as OrderModel } from "../models/order.model.js";
import { ReturnSort } from "../types/return.enum.js";

export class ReturnQueryBuilder {

    static build(qs: ReturnRequestQSDto): FindAndCountOptions {

        const where = this.buildReturnWhere(qs);

        const itemsInclude = this.buildItemsInclude(qs);
        const adminInclude = this.buildAdminInclude();
        const orderUserInclude = this.buildOrderInclude();

        const include: IncludeOptions[] = [
            itemsInclude,
            adminInclude,
            orderUserInclude
        ];

        return {
            where,
            include,
            order: this.buildOrder(qs),
            limit: qs.limit,
            offset: (qs.page - 1) * qs.limit,
            distinct: true,
        };
    }

    private static buildReturnWhere(
        qs: ReturnRequestQSDto
    ): WhereOptions<ReturnRequest> {

        const conditions: WhereOptions<ReturnRequest>[] = []

        if (qs.q) {
            conditions.push({
                [Op.or]: [
                    {
                        adminNote : {
                            [Op.like]: `%${qs.q}%`
                        }
                    },
                    {
                        returnTrackingCode : {
                            [Op.like]: `%${qs.q}%`
                        }
                    },
                    {
                        '$order.orderNumber$': {
                            [Op.like]: `%${qs.q}%`
                        }
                    },
                    {
                        '$order.user.name$': {
                            [Op.like]: `%${qs.q}%`
                        }
                    }
                ]
            });
        }

        if (qs.returnStatus !== undefined) {
            conditions.push({
                status : qs.returnStatus
            })
        }

        if (qs.refundStatus !== undefined) {
            conditions.push({
                refundStatus : qs.refundStatus
            })
        }

        if (qs.reviewedBy !== undefined && qs.reviewedBy.length > 0) {
            conditions.push({
                reviewedBy : {
                    [Op.in] : qs.reviewedBy
                }
            })
        }

        const refundPriceCondition: {
            [Op.gte]?: number;
            [Op.lte]?: number;
        } = {};

        if (qs.minRefundPrice !== undefined)
            refundPriceCondition[Op.gte] = qs.minRefundPrice;

        if (qs.maxRefundPrice !== undefined)
            refundPriceCondition[Op.lte] = qs.maxRefundPrice;

        if (Object.keys(refundPriceCondition).length) {
            conditions.push({
                refundAmount : refundPriceCondition
            })
        }

        const createdDateCondition: {
            [Op.gte]?: Date;
            [Op.lte]?: Date;
        } = {};

        if (qs.createdFrom !== undefined)
            createdDateCondition[Op.gte] = qs.createdFrom;

        if (qs.createdTo !== undefined)
            createdDateCondition[Op.lte] = qs.createdTo;

        if (Object.keys(createdDateCondition).length) {
            conditions.push({
                createdAt : createdDateCondition
            })
        }

        const resolvedDateCondition: {
            [Op.gte]?: Date;
            [Op.lte]?: Date;
        } = {};

        if (qs.resolvedFrom !== undefined)
            resolvedDateCondition[Op.gte] = qs.resolvedFrom;

        if (qs.resolvedTo !== undefined)
            resolvedDateCondition[Op.lte] = qs.resolvedTo;

        if (Object.keys(resolvedDateCondition).length) {
            conditions.push({
                resolvedAt : resolvedDateCondition
            })
        }

        const reviewedDateCondition: {
            [Op.gte]?: Date;
            [Op.lte]?: Date;
        } = {};

        if (qs.reviewedFrom !== undefined)
            reviewedDateCondition[Op.gte] = qs.reviewedFrom;

        if (qs.reviewedTo !== undefined)
            reviewedDateCondition[Op.lte] = qs.reviewedTo;

        if (Object.keys(reviewedDateCondition).length) {
            conditions.push({
                reviewedAt : reviewedDateCondition
            })
        }

        return {
            [Op.and]: conditions
        };
    }

    private static buildItemsInclude(
        qs: ReturnRequestQSDto,
    ): IncludeOptions {

        return {
            model: ReturnItem,
            as: "items",
            attributes: [
                'id',
                'returnRequestId',
                'orderItemId',
                'reason',
                'description',
                'quantity',
                'refundAmount',
                'createdAt',
            ],
            required: true,
            where : {
                ...(
                    qs.orderItemId
                        ? {
                            orderItemId : {
                                [Op.in] : qs.orderItemId
                            }
                        }
                        : {}
                )
            },
        }

    }

    private static buildAdminInclude() : IncludeOptions {
        return {
            model: User,
            as: "admin",
            required: false,
            attributes: ['id', 'name'],
        }
    }

    private static buildOrderInclude() : IncludeOptions {
        return {
            model: OrderModel,
            as: "order",
            required: true,
            attributes: ['id', 'orderNumber', 'status', 'finalPrice'],
            include : [
                {
                    model : User,
                    as : 'user',
                    attributes : ['id', 'name'],
                    required : true
                }
            ]
        }
    }

    private static buildOrder(
        qs: ReturnRequestQSDto
    ): Order {

        switch (qs.sort) {

            case ReturnSort.NEWEST:
                return [
                    ["createdAt", "DESC"],
                    ["id", "DESC"]
                ];

            case ReturnSort.OLDEST:
                return [
                    ["createdAt", "ASC"],
                    ["id", "ASC"]
                ];

            case ReturnSort.REFUND_AMOUNT_ASC:
                return [
                    ["refundAmount", "ASC"],
                    ["id", "ASC"]
                ];

            case ReturnSort.REFUND_AMOUNT_DESC:
                return [
                    ["refundAmount", "DESC"],
                    ["id", "DESC"]
                ];

            case ReturnSort.REVIEWED_AT_ASC:
                return [
                    ["reviewedAt", "ASC"],
                    ["id", "ASC"]
                ];

            case ReturnSort.REVIEWED_AT_DESC:
                return [
                    ["reviewedAt", "DESC"],
                    ["id", "DESC"]
                ];

            default:
                return [
                    ["createdAt", "DESC"],
                    ['id', 'DESC']
                ];
        }

    }

}