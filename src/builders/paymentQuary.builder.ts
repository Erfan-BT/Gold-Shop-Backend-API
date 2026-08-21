import {
    FindAndCountOptions,
    IncludeOptions,
    Op,
    Order,
    WhereOptions
} from "sequelize";

import { PaymentSort } from "../types/payment.enum.js";
import { PaymentQSDto } from "../validation/payment.validation.js";
import Payment from "../models/payment.model.js";
import { Order as OrderModel } from "../models/order.model.js";

export class PaymentQueryBuilder {

    static build(qs : PaymentQSDto): FindAndCountOptions {

        const where = this.buildPaymentWhere(qs);

        return {
            where,
            attributes : [
                'id',
                'orderId',
                'amount',
                'transactionId',
                'authorityCode',
                'cardPan',
                'status',
                'refundAmount',
                'refundReason',
                'refundId',
                'paidAt',
                'refundedAt',
                'updatedAt'
            ],
            include : qs.q
                ? [
                    {
                        model : OrderModel,
                        as : 'order',
                        attributes : [],
                        where : {
                            orderNumber: {
                                [Op.like]: `%${qs.q}%`
                            }
                        }
                    }
                ]
                : [],
            order: this.buildOrder(qs),
            limit: qs.limit,
            offset: (qs.page - 1) * qs.limit,
        }
    }

    private static buildPaymentWhere(
        qs: PaymentQSDto
    ): WhereOptions<Payment> {

        const conditions: WhereOptions<Payment>[] = []

        if (qs.q) {
            conditions.push({
                [Op.or]: [
                    {
                        cardPan: {
                            [Op.like]: `%${qs.q}%`
                        }
                    },
                    {
                        transactionId: {
                            [Op.like]: `%${qs.q}%`
                        }
                    },
                    {
                        authorityCode: {
                            [Op.like]: `%${qs.q}%`
                        }
                    },
                    {
                        referenceCode: {
                            [Op.like]: `%${qs.q}%`
                        }
                    },
                    {
                        terminal_id : {
                            [Op.like] : `%${qs.q}%`
                        }
                    }
                ]
            });

        }

        if (qs.orderId !== undefined) {
            conditions.push({
                orderId : qs.orderId
            })
        }

        if (qs.status !== undefined) {
            conditions.push({
                status : qs.status
            })
        }

        const dateCondition: {
            [Op.gte]?: Date;
            [Op.lte]?: Date;
        } = {};

        if (qs.from !== undefined)
            dateCondition[Op.gte] = qs.from;

        if (qs.to !== undefined)
            dateCondition[Op.lte] = qs.to;

        if (Object.keys(dateCondition).length) {
            conditions.push({
                paidAt : dateCondition
            })
        }

        const priceCondition: {
            [Op.gte]?: number;
            [Op.lte]?: number;
        } = {};

        if (qs.minPrice !== undefined)
            priceCondition[Op.gte] = qs.minPrice;

        if (qs.maxPrice !== undefined)
            priceCondition[Op.lte] = qs.maxPrice;

        if (Object.keys(priceCondition).length) {
            conditions.push({
                amount : priceCondition
            })
        }

        if (qs.hasRefund !== undefined) {
            conditions.push({
                refundId: qs.hasRefund
                    ? { [Op.ne]: null }
                    : { [Op.is]: null }
            })
        }

        return {
            [Op.and]: conditions
        };
    }

    private static buildOrder(
        qs: PaymentQSDto
    ): Order {

        switch (qs.sort) {

            case PaymentSort.NEWEST:
                return [
                    ["paidAt", "DESC"]
                ];

            case PaymentSort.OLDEST:
                return [
                    ["paidAt", "ASC"]
                ];

            case PaymentSort.PRICE_ASC:
                return [
                    ["amount", "ASC"]
                ];

            case PaymentSort.PRICE_DESC:
                return [
                    ["amount", "DESC"]
                ];
            case PaymentSort.REFUND_PRICE_ASC:
                return [
                    ["refundAmount", "ASC"]
                ];

            case PaymentSort.REFUND_PRICE_DESC:
                return [
                    ["refundAmount", "DESC"]
                ];

            default:
                return [
                    ["paidAt", "DESC"]
                ];
        }

    }

}