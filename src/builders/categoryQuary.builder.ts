import {
    FindAndCountOptions,
    IncludeOptions,
    Op,
    Order,
    WhereOptions
} from "sequelize";

import { CategoryQSDto } from "../validation/category.vallidation.js";
import { CategorySort } from "../types/category.enum.js";
import { Category } from "../models/category.model.js";

export class CategoryQueryBuilder {

    static build(qs : CategoryQSDto): FindAndCountOptions {

        const where = this.buildCategoryWhere(qs);

        return {
            where,
            order: this.buildOrder(qs),
            limit: qs.limit,
            offset: (qs.page - 1) * qs.limit,
        };
    }

    private static buildCategoryWhere(
        qs: CategoryQSDto
    ): WhereOptions<Category> {

        const conditions: WhereOptions<Category>[] = []

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
                ]
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
            })
        }

        if (qs.isActive !== undefined) {
            conditions.push({
                isActive : qs.isActive
            })
        }

        if (qs.parentId !== undefined) {
            conditions.push({
                parentId : qs.parentId
            })
        }

        if (qs.isRoot !== undefined) {
            conditions.push({
                parentId : {
                    ...(
                        qs.isRoot ? {
                            [Op.is] : null
                        } : {
                            [Op.not] : null
                        }
                    )
                }
            })
        }

        return {
            [Op.and]: conditions
        };
    }

    private static buildOrder(
        qs: CategoryQSDto
    ): Order {

        switch (qs.sort) {

            case CategorySort.NEWEST:
                return [
                    ["createdAt", "DESC"]
                ];

            case CategorySort.OLDEST:
                return [
                    ["createdAt", "ASC"]
                ];

            case CategorySort.TITLE_ASC:
                return [
                    ["title", "ASC"]
                ];

            case CategorySort.TITLE_DESC:
                return [
                    ["title", "DESC"]
                ];

            default:
                return [
                    ["createdAt", "DESC"]
                ];
        }

    }

}