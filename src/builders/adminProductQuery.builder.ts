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

import { AdminProductQSDto } from "../validation/product.validation.js";
import { ProductSort } from "../types/product.enum.js";

export class AdminProductQueryBuilder {

    static build(qs: AdminProductQSDto): FindAndCountOptions {

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
        qs: AdminProductQSDto
    ): WhereOptions<Product> {

        const conditions: WhereOptions<Product>[] = []

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

        const averageRatingCondition: {
            [Op.gte]?: number;
            [Op.lte]?: number;
        } = {};

        if (qs.minAverageRating !== undefined)
            averageRatingCondition[Op.gte] = qs.minAverageRating;

        if (qs.maxAverageRating !== undefined)
            averageRatingCondition[Op.lte] = qs.maxAverageRating;

        if (Object.keys(averageRatingCondition).length) {

            conditions.push({
                averageRating : averageRatingCondition
            });

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
            });

        }

        if (qs.isActive !== undefined) {
            conditions.push({
                isActive : qs.isActive
            })
        }

        return {
            [Op.and]: conditions
        };
    }

    private static buildVariantInclude(
        qs: AdminProductQSDto,
        now: Date
    ): IncludeOptions {

        const where: Record<string, unknown> = {}

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
            };

        if (qs.color !== undefined && qs.color.length > 0)
            where.color = {
                [Op.in] : qs.color
            };

        if (qs.stone !== undefined && qs.stone.length > 0)
            where.stoneType = {
                [Op.in] : qs.stone
            };
        
        if (qs.inStock !== undefined) {

            include.push({
                model: Inventory,
                as: "inventory",
                required: false,
                attributes: [],
                where: {
                    quantity :
                        qs.inStock
                        ? { [Op.gt] : 0 }
                        : { [Op.lte] : 0 }
                }
            });

        }

        if (qs.discount === true) {

            include.push({
                model: ProductDiscount,
                as: "discounts",
                required: true,
                attributes: [],
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
            attributes: ['id'],
            required: false,
            where,
            include
        };

    }

    private static buildCategoryInclude(
        qs: AdminProductQSDto
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
                    attributes: [],
                    where: {
                        slug : {
                            [Op.in] : qs.category
                        }
                    }
                }
            ]
        };

    }

    private static buildOrder(
        qs: AdminProductQSDto
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