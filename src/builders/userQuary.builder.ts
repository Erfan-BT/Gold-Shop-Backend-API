import {
    FindAndCountOptions,
    IncludeOptions,
    Op,
    Order,
    Sequelize,
    WhereOptions
} from "sequelize";

import { UserQSDto } from "../validation/user.validation.js";
import { UserSort } from "../types/user.enum.js";
import { Role, UserRole } from "../models/role.model.js";
import Address from "../models/address.model.js";
import { Order as OrderModel } from "../models/order.model.js";
import User from "../models/user.model.js";

export class UserQueryBuilder {

    static build(qs : UserQSDto): FindAndCountOptions {

        const where = this.buildUserWhere(qs);

        const roleInclude = this.buildRoleInclude(qs);
        const addressInclude = this.buildAddressInclude(qs);
        const orderInclude = this.buildOrderInclude(qs);

        const include: IncludeOptions[] = [
            roleInclude,
            addressInclude,
            orderInclude
        ]

        return {
            where,
            include,
            attributes : {exclude : ['password']},
            order: this.buildOrder(qs),
            limit: qs.limit,
            offset: (qs.page - 1) * qs.limit,
            distinct: true,
            subQuery: false
        };
    }

    private static buildUserWhere(
        qs: UserQSDto
    ): WhereOptions<User> {

        const conditions: WhereOptions<User>[] = []

        if (qs.q) {
            conditions.push({
                [Op.or]: [
                    {
                        name: {
                            [Op.like]: `%${qs.q}%`
                        }
                    },
                    {
                        email: {
                            [Op.like]: `%${qs.q}%`
                        }
                    },
                    {
                        phone: {
                            [Op.like]: `%${qs.q}%`
                        }
                    }
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

        if (qs.isEmailVerified !== undefined) {
            conditions.push({
                isEmailVerified : qs.isEmailVerified
            })
        }

        if (qs.hasOrder !== undefined) {
            conditions.push(
                qs.hasOrder
                    ? Sequelize.literal(`
                        EXISTS (
                            SELECT 1
                            FROM orders
                            WHERE orders.userId = User.id
                        )
                    `)
                    : Sequelize.literal(`
                        NOT EXISTS (
                            SELECT 1
                            FROM orders
                            WHERE orders.userId = User.id
                        )
                    `)
            )
        }

        return {
            [Op.and]: conditions
        };
    }

    private static buildRoleInclude(
        qs: UserQSDto
    ): IncludeOptions {

        return {
            model: UserRole,
            as: "roles",
            attributes: ['id'],
            required: true,
            include : [
                {
                    model: Role,
                    as: "role",
                    required: true,
                    attributes: ['name'],
                    where : (qs.roles !== undefined && qs.roles.length > 0)
                    ? {
                        name : {
                            [Op.in] : qs.roles
                        }
                    } : {}
                }
            ]
        }

    }

    private static buildAddressInclude(qs : UserQSDto) : IncludeOptions {
        return {
            model : Address,
            as : 'addresses',
            attributes : ['id', 'city'],
            required : false,
            where : qs.q
            ? {
                [Op.or]: [
                    {
                        city: {
                            [Op.like]: `%${qs.q}%`
                        }
                    },
                    {
                        postalCode: {
                            [Op.like]: `%${qs.q}%`
                        }
                    },
                    {
                        addressLine: {
                            [Op.like]: `%${qs.q}%`
                        }
                    }
                ]
            } : {}
        }
    }

    private static buildOrderInclude(qs : UserQSDto) : IncludeOptions {
        return {
            model : OrderModel,
            as : 'orders',
            attributes : ['id', 'orderNumber'],
            required : false
        }
    }

    private static buildOrder(
        qs: UserQSDto
    ): Order {

        switch (qs.sort) {

            case UserSort.NEWEST:
                return [
                    ["createdAt", "DESC"]
                ];

            case UserSort.OLDEST:
                return [
                    ["createdAt", "ASC"]
                ];

            case UserSort.NAME_ASC:
                return [
                    ["name", "ASC"]
                ];

            case UserSort.NAME_DESC:
                return [
                    ["name", "DESC"]
                ];

            default:
                return [
                    ["createdAt", "DESC"]
                ];
        }

    }

}