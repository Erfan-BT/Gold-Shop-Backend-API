import {
    FindAndCountOptions,
    Op,
    Order,
    WhereOptions
} from "sequelize";
import { AdminAuditQSDto } from "../validation/audit.validation.js";
import AdminAuditLog from "../models/adminAuditLog.js";
import { AdminAuditEntity, AdminAuditSort } from "../types/adminAuditLog.enum.js";
import User from "../models/user.model.js";

export class AdminAuditQueryBuilder {

    static build(qs : AdminAuditQSDto, isFinance : boolean): FindAndCountOptions {

        const where = this.buildOrderWhere(qs, isFinance);

        return {
            where,
            include : [
                {
                    model : User,
                    as : 'admin',
                    required : true,
                    attributes : ['id', 'name', 'email', 'phone']
                }
            ],
            order: this.buildOrder(qs),
            limit: qs.limit,
            offset: (qs.page - 1) * qs.limit,
            distinct: true,
        }
    }

    private static buildOrderWhere(
        qs: AdminAuditQSDto,
        isFinance : boolean
    ): WhereOptions<AdminAuditLog> {

        const conditions: WhereOptions<AdminAuditLog>[] = []

        if (qs.q) {

            conditions.push({
                [Op.or]: [
                    {
                        reason : {
                            [Op.like]: `%${qs.q}%`
                        }
                    },
                    {
                        ipAddress : {
                            [Op.like]: `%${qs.q}%`
                        }
                    }
                ]
            })
        }

        if (qs.adminId !== undefined) {
            conditions.push({
                adminId : qs.adminId
            })
        }

        if (qs.action !== undefined && qs.action.length !== 0) {
            conditions.push({
                adminId : {
                    [Op.in] : qs.action
                }
            })
        }

        if (isFinance) {
            conditions.push({
                entityType : AdminAuditEntity.PAYMENT
            })
        } else if (qs.entityType !== undefined && qs.entityType.length !== 0) {
            conditions.push({
                entityType : {
                    [Op.in] : qs.entityType
                }
            })
        }

        if (qs.entityId !== undefined && qs.entityId.length !== 0) {
            conditions.push({
                entityId : {
                    [Op.in] : qs.entityId
                }
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

        return {
            [Op.and]: conditions
        }
    }

    private static buildOrder(
        qs: AdminAuditQSDto
    ): Order {

        switch (qs.sort) {
            case AdminAuditSort.NEWEST:
                return [
                    ["createdAt", "DESC"]
                ]
            
            case AdminAuditSort.OLDEST:
                return [
                    ["createdAt", "ASC"]
                ]
            
            case AdminAuditSort.ACTION_DESC:
                return [
                    ["action", "DESC"]
                ]
            
            case AdminAuditSort.ACTION_ASC:
                return [
                    ["action", "ASC"]
                ]

            case AdminAuditSort.ENTITY_TYPE_DESC:
                return [
                    ["entityType", "DESC"]
                ];

            case AdminAuditSort.ENTITY_TYPE_ASC:
                return [
                    ["entityType", "ASC"]
                ];

            case AdminAuditSort.ADMIN_ID_DESC:
                return [
                    ["adminId", "DESC"]
                ];

            case AdminAuditSort.ADMIN_ID_ASC:
                return [
                    ["adminId", "ASC"]
                ];

            default:
                return [
                    ["createdAt", "DESC"]
                ];
        }

    }

}