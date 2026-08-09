import {
    FindAndCountOptions,
    IncludeOptions,
    Op,
    Order,
    WhereOptions
} from "sequelize";

import { UserQSDto } from "../validation/users.validation.js";
import { UserSort } from "../types/user.enum.js";
import { Role, UserRole } from "../models/role.model.js";
import Address from "../models/address.model.js";
import { Order as OrderModel } from "../models/order.model.js";

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
    ): WhereOptions {

        const conditions: WhereOptions[] = []

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

        if (qs.isActive !== undefined && qs.isActive !== null) {
            conditions.push({
                isActive : qs.isActive
            })
        }

        if (qs.isEmailVerified !== undefined && qs.isEmailVerified !== null) {
            conditions.push({
                isEmailVerified : qs.isEmailVerified
            })
        }

        return {
            [Op.and]: conditions
        };
    }

    private static buildRoleInclude(
        qs: UserQSDto
    ): IncludeOptions {

        const include: IncludeOptions[] = [];

        if (qs.roles !== undefined && qs.roles.length > 0) {
            include.push({
                model: Role,
                as: "role",
                required: true,
                attributes: [],
                where: {
                    name : {
                        [Op.in] : qs.roles
                    }
                }
            });
        }

        return {
            model: UserRole,
            as: "roles",
            attributes: [],
            required: true,
            include
        };

    }

    private static buildAddressInclude(qs : UserQSDto) : IncludeOptions {
        return {
            model : Address,
            as : 'addresses',
            attributes : ['id'],
            required : false,
        }
    }

    private static buildOrderInclude(qs : UserQSDto) : IncludeOptions {
        return {
            model : OrderModel,
            as : 'orders',
            attributes : ['id'],
            required : false,
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