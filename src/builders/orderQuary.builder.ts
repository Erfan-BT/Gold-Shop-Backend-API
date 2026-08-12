import {
    FindAndCountOptions,
    IncludeOptions,
    Op,
    Order,
    WhereOptions
} from "sequelize";
import { OrdersAdminDto } from "../validation/order.validation.js";
import { OrderItem } from "../models/order.model.js";
import { OrderSort } from "../types/order.enum.js";

export class OrderQueryBuilder {

    static build(qs : OrdersAdminDto, userId ?: number): FindAndCountOptions {

        const where = this.buildOrderWhere(qs, userId);

        const itemsInclude = this.buildItemsInclude(qs);

        const include: IncludeOptions[] = [
            itemsInclude
        ];

        return {
            where,
            include,
            order: this.buildOrder(qs),
            limit: qs.limit,
            offset: (qs.page - 1) * qs.limit,
            distinct: true,
            // subQuery: false
        }
    }

    private static buildOrderWhere(
        qs: OrdersAdminDto,
        userId ?: number
    ): WhereOptions {

        const conditions: WhereOptions[] = []

        if (qs.q) {

            conditions.push({
                [Op.or]: [
                    {
                        orderNumber : {
                            [Op.like]: `%${qs.q}%`
                        }
                    },
                    {
                        uuid : {
                            [Op.like]: qs.q
                        }
                    },
                    {
                        trackingCode : {
                            [Op.like]: `%${qs.q}%`
                        }
                    }
                ]
            })
        }

        if (qs.coupon) {
            conditions.push({
                couponId : {
                    [Op.ne] : null
                }
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
                finalPrice : priceCondition
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
                createdAt : dateCondition
            })
        }

        if (qs.status) {
            conditions.push({
                status : qs.status
            })
        }

        if (qs.paymentStatus) {
            conditions.push({
                paymentStatus : qs.paymentStatus
            })
        }

        if (qs.shippingMethod) {
            conditions.push({
                shippingMethod : qs.shippingMethod
            })
        }

        if (userId)
            conditions.push({
                userId
            })

        if (!conditions.length)
            return {}

        return {
            [Op.and]: conditions
        }
    }

    private static buildItemsInclude(
        qs : OrdersAdminDto
    ): IncludeOptions {

        return {
            model: OrderItem,
            as: "items",
            attributes: ['quantity'],
            required: true,
        }

    }

    private static buildOrder(
        qs: OrdersAdminDto
    ): Order {

        switch (qs.sort) {
            case OrderSort.NEWEST:
                return [
                    ["createdAt", "DESC"]
                ]
            
            case OrderSort.OLDEST:
                return [
                    ["createdAt", "ASC"]
                ]
            
            case OrderSort.PRICE_DESC:
                return [
                    ["subtotal", "DESC"]
                ]
            
            case OrderSort.PRICE_ASC:
                return [
                    ["subtotal", "ASC"]
                ]

            case OrderSort.DISCOUNT_DESC:
                return [
                    ["discountAmount", "DESC"]
                ];

            case OrderSort.DISCOUNT_ASC:
                return [
                    ["discountAmount", "ASC"]
                ];

            case OrderSort.TOTAL_DESC:
                return [
                    ["finalPrice", "DESC"]
                ];

            case OrderSort.TOTAL_ASC:
                return [
                    ["finalPrice", "ASC"]
                ];

            default:
                return [
                    ["createdAt", "DESC"]
                ];
        }

    }

}