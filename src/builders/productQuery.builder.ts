import {
    FindAndCountOptions,
    IncludeOptions,
    Op,
    Order,
    WhereOptions
} from "sequelize";

import {
    Product,
    ProductVariant,
    ProductDiscount
} from "../models/product.model.js";

import {
    Category,
    ProductCategory
} from "../models/category.model.js";

import Inventory from "../models/inventory.model.js";

import { ProductQSDto } from "../validation/product.validation.js";
import { ProductSort } from "../types/product.enum.js";

export class ProductQueryBuilder {

    static build(qs: ProductQSDto): FindAndCountOptions {

        const now = new Date();

        const where = this.buildProductWhere(qs);

        const variantInclude = this.buildVariantInclude(qs, now);

        const include: IncludeOptions[] = [
            variantInclude
        ];

        const categoryInclude = this.buildCategoryInclude(qs);

        if (categoryInclude)
            include.push(categoryInclude);

        return {
            where,
            include,
            order: this.buildOrder(qs),
            limit: qs.limit,
            offset: (qs.page - 1) * qs.limit,
            distinct: true,
            subQuery: false
        };
    }

    private static buildProductWhere(
        qs: ProductQSDto
    ): WhereOptions {

        const conditions: WhereOptions[] = [
            {
                isActive: true
            }
        ];

        if (qs.q) {

            conditions.push({
                [Op.or]: [
                    {
                        title: {
                            [Op.like]: `%${qs.q}%`
                        }
                    },
                    {
                        slug: {
                            [Op.like]: `%${qs.q}%`
                        }
                    },
                    {
                        description: {
                            [Op.like]: `%${qs.q}%`
                        }
                    }
                ]
            });

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
                lowestPrice: priceCondition
            });

        }

        return {
            [Op.and]: conditions
        };
    }

    private static buildVariantInclude(
        qs: ProductQSDto,
        now: Date
    ): IncludeOptions {

        const where: Record<string, unknown> = {
            isActive: true
        };

        const include: IncludeOptions[] = [];

        const weightCondition: {
            [Op.gte]?: number;
            [Op.lte]?: number;
        } = {};

        if (qs.minWeight !== undefined)
            weightCondition[Op.gte] = qs.minWeight;

        if (qs.maxWeight !== undefined)
            weightCondition[Op.lte] = qs.maxWeight;

        if (Object.keys(weightCondition).length)
            where.weight = weightCondition;

        if (qs.karat !== undefined && qs.karat.length > 0)
            where.karat = {
                [Op.in] : qs.karat
            }

        if (qs.color !== undefined && qs.color.length > 0)
            where.color = {
                [Op.in] : qs.color
            }

        if (qs.stone !== undefined && qs.stone.length > 0)
            where.stoneType = {
                [Op.in] : qs.stone
            }
        
        if (qs.inStock === true) {

            include.push({
                model: Inventory,
                as: "inventory",
                required: true,
                attributes: ['id', 'quantity'],
                where: {
                    quantity: {
                        [Op.gt] : 0
                    }
                }
            });

        }

        if (qs.discount === true) {

            include.push({
                model: ProductDiscount,
                as: "discounts",
                required: true,
                attributes: ['id', 'type', 'value'],
                where: {
                    isActive: true,
                    startDate: {
                        [Op.lte]: now
                    },
                    endDate: {
                        [Op.gte]: now
                    }
                }
            });

        }

        return {
            model: ProductVariant,
            as: "variants",
            attributes: [
                'id',
                'weight',
                'karat',
                'currentPrice',
            ],
            required: true,
            where,
            include
        };

    }

    private static buildCategoryInclude(
        qs: ProductQSDto
    ): IncludeOptions | null {

        if (qs.category === undefined || qs.category.length === 0)
            return null;

        return {
            model: ProductCategory,
            as: "categories",
            required: true,
            attributes: [],
            include: [
                {
                    model: Category,
                    as: "category",
                    required: true,
                    attributes: [
                        'title',
                        'slug',
                    ],
                    where: {
                        [Op.or] : {
                            title : {
                                [Op.in] : qs.category
                            },
                            slug : {
                                [Op.in] : qs.category
                            },
                        },
                        isActive : true
                    }
                }
            ]
        };

    }

    private static buildOrder(
        qs: ProductQSDto
    ): Order {

        switch (qs.sort) {

            case ProductSort.NEWEST:
                return [
                    ["createdAt", "DESC"]
                ];

            case ProductSort.OLDEST:
                return [
                    ["createdAt", "ASC"]
                ];

            case ProductSort.POPULAR:
                return [
                    ["soldCount", "DESC"]
                ];

            case ProductSort.NOT_POPULAR:
                return [
                    ["soldCount", "ASC"]
                ];

            case ProductSort.PRICE_DESC:
                return [
                    ["lowestPrice", "DESC"]
                ];

            case ProductSort.PRICE_ASC:
                return [
                    ["lowestPrice", "ASC"]
                ];

            case ProductSort.REVIEWCOUNT_DESC:
                return [
                    ["reviewCount", "DESC"]
                ];

            case ProductSort.REVIEWCOUNT_ASC:
                return [
                    ["reviewCount", "ASC"]
                ];

            default:
                return [
                    ["createdAt", "DESC"]
                ];
        }

    }

}