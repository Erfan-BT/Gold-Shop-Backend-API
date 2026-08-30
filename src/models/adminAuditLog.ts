import {
    CreationOptional,
    DataTypes,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute
} from "sequelize";
import User from "./user.model.js";
import { AdminAuditAction, AdminAuditEntity } from "../types/adminAuditLog.enum.js";
import sequelize from "../configs/sequelize.config.js";

export default class AdminAuditLog extends Model<
    InferAttributes<AdminAuditLog>,
    InferCreationAttributes<AdminAuditLog>
> {
    declare id: CreationOptional<number>

    declare adminId: ForeignKey<User["id"]>

    declare action: AdminAuditAction

    declare entityType: AdminAuditEntity
    declare entityId: number | null

    declare oldValues: CreationOptional<Record<string, unknown> | null>
    declare newValues: CreationOptional<Record<string, unknown> | null>

    declare reason: CreationOptional<string | null>

    declare ipAddress: string | null

    declare createdAt: CreationOptional<Date>

    // Associations
    declare admin ?: NonAttribute<User>
}

AdminAuditLog.init({
    id : {
        type : DataTypes.INTEGER,
        primaryKey : true,
        autoIncrement : true
    },
    adminId : {
        type : DataTypes.INTEGER,
        allowNull : false
    },
    action : {
        type : DataTypes.ENUM(...Object.values(AdminAuditAction)),
        allowNull : false
    },
    entityType : {
        type : DataTypes.ENUM(...Object.values(AdminAuditEntity)),
        allowNull : false
    },
    entityId : {
        type : DataTypes.INTEGER,
        allowNull : true
    },
    oldValues : {
        type : DataTypes.STRING,
        allowNull : true
    },
    newValues : {
        type : DataTypes.STRING,
        allowNull : true
    },
    reason : {
        type : DataTypes.STRING(200),
        allowNull : true
    },
    ipAddress : {
        type : DataTypes.STRING(50),
        allowNull : true
    },
    createdAt : {
        type : DataTypes.DATE
    }
}, {
    sequelize,
    modelName : 'AdminAuditLog',
    createdAt : 'createdAt',
    updatedAt : false,
    indexes : [
        {
            fields : ['adminId']
        },
        {
            fields : ['action']
        },
        {
            fields : ['entityType']
        },
        {
            fields : ['entityId']
        }
    ]
})