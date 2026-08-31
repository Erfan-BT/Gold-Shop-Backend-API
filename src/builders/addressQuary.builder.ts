import {
    FindAndCountOptions,
    IncludeOptions,
    Op,
    Order,
    WhereOptions
} from "sequelize";

import { AddressesQSDto } from "../validation/address.validation.js";
import { AddressSort } from "../types/address.enum.js";
import User from "../models/user.model.js";
import Address from "../models/address.model.js";

export class AddressQueryBuilder {

    static build(qs : AddressesQSDto): FindAndCountOptions {

        const where = this.buildAddressWhere(qs);

        return {
            where,
            include: [
                {
                    model: User,
                    as: "user",
                    required: false,
                    attributes: ["id", "name", "email", "phone"]
                }
            ],
            order: this.buildOrder(qs),
            limit: qs.limit,
            offset: (qs.page - 1) * qs.limit,
        }
    }

    private static buildAddressWhere(
        qs: AddressesQSDto
    ): WhereOptions<Address> {

        const conditions: WhereOptions<Address>[] = []

        if (qs.q) {
            conditions.push({
                [Op.or]: [
                    {
                        addressLine: {
                            [Op.like]: `%${qs.q}%`
                        }
                    },
                    {
                        city: {
                            [Op.like]: `%${qs.q}%`
                        }
                    },
                    {
                        postalCode: {
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

        if (qs.isDefault !== undefined) {
            conditions.push({
                isDefault : qs.isDefault
            })
        }

        if (qs.userId !== undefined) {
            conditions.push({
                userId : qs.userId
            })
        }

        return {
            [Op.and]: conditions
        };
    }

    private static buildOrder(
        qs: AddressesQSDto
    ): Order {

        switch (qs.sort) {

            case AddressSort.NEWEST:
                return [
                    ["createdAt", "DESC"]
                ];

            case AddressSort.OLDEST:
                return [
                    ["createdAt", "ASC"]
                ];

            case AddressSort.CITY_ASC:
                return [
                    ["city", "ASC"]
                ];

            case AddressSort.CITY_DESC:
                return [
                    ["city", "DESC"]
                ];
            case AddressSort.USERID_ASC:
                return [
                    ["userId", "ASC"]
                ];

            case AddressSort.USERID_DESC:
                return [
                    ["userId", "DESC"]
                ];

            default:
                return [
                    ["createdAt", "DESC"]
                ];
        }

    }

}