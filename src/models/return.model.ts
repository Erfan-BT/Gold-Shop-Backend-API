import {
    CreationOptional,
    DataTypes,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute
} from "sequelize";
import sequelize from "../configs/sequelize.config.js";
import { Order , OrderItem } from "./order.model.js";
import User from "./user.model.js";
import { RefundStatus, ReturnItemStatus, ReturnStatus } from "../types/return.enum.js";

// Return Request
export class ReturnRequest extends Model<
    InferAttributes<ReturnRequest>,
    InferCreationAttributes<ReturnRequest>
> {
    declare id: CreationOptional<number>;

    declare orderId: ForeignKey<Order["id"]>;

    declare status: ReturnStatus;

    declare reviewedBy: CreationOptional<ForeignKey<User["id"]> | null>;
    declare reviewedAt: CreationOptional<Date | null>;
    declare adminNote: CreationOptional<string | null>;

    declare refundAmount: CreationOptional<number | null>;
    declare refundStatus: RefundStatus;

    declare returnTrackingCode: CreationOptional<string | null>;

    declare receivedBy : CreationOptional<ForeignKey<User["id"]> | null>
    declare receivedAt : CreationOptional<Date | null>

    declare resolvedAt: CreationOptional<Date | null>;

    declare canceledBy : CreationOptional<ForeignKey<User['id']> | null>
    declare canceledAt : CreationOptional<Date | null>
    declare cancelReason : CreationOptional<string | null>

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date | null>;
    declare deletedAt: CreationOptional<Date | null>;

    // Associations
    declare order?: NonAttribute<Order>;

    declare items ?: NonAttribute<ReturnItem[]>;

    declare admin ?: NonAttribute<User>;
}

ReturnRequest.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        orderId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM(...Object.values(ReturnStatus)),
            allowNull: false
        },
        reviewedBy: {
            type: DataTypes.INTEGER
        },
        reviewedAt: {
            type: DataTypes.DATE
        },
        adminNote: {
            type: DataTypes.TEXT
        },
        refundAmount: {
            type: DataTypes.DECIMAL(15, 2)
        },
        refundStatus: {
            type: DataTypes.ENUM(...Object.values(RefundStatus))
        },
        returnTrackingCode: {
            type: DataTypes.STRING(100)
        },
        receivedBy : {
            type : DataTypes.INTEGER
        },
        receivedAt : {
            type: DataTypes.DATE
        },
        resolvedAt: {
            type: DataTypes.DATE
        },
        canceledBy : {
            type : DataTypes.INTEGER
        },
        canceledAt : {
            type : DataTypes.DATE
        },
        cancelReason : {
            type : DataTypes.STRING
        },
        createdAt: {
            type: DataTypes.DATE
        },
        updatedAt: {
            type: DataTypes.DATE
        },
        deletedAt: {
            type: DataTypes.DATE
        }
    },
    {
        sequelize,
        modelName: "ReturnRequest",
        createdAt: "createdAt",
        updatedAt: "updatedAt",
        deletedAt: "deletedAt",
        paranoid: true,
        indexes: [
            {
                fields: ["orderId"]
            },
            {
                fields: ["status"]
            }
        ]
    }
);

// Return Item
export class ReturnItem extends Model<
    InferAttributes<ReturnItem>,
    InferCreationAttributes<ReturnItem>
> {
    declare id: CreationOptional<number>;

    declare returnRequestId: ForeignKey<ReturnRequest["id"]>;
    declare orderItemId: ForeignKey<OrderItem["id"]>;

    declare reason: string;
    declare description: CreationOptional<string | null>;

    declare quantity: number;
    declare refundAmount: CreationOptional<number | null>;

    declare status : ReturnItemStatus;
    declare adminNote: CreationOptional<string | null>;
    declare reviewedBy: CreationOptional<ForeignKey<User['id']> | null>;
    declare reviewedAt: CreationOptional<Date | null>;

    declare createdAt: CreationOptional<Date>;
    declare deletedAt: CreationOptional<Date | null>;

    // Associations
    declare orderItem?: NonAttribute<OrderItem>;
}

ReturnItem.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        returnRequestId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        orderItemId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        reason: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        refundAmount: {
            type: DataTypes.DECIMAL(15, 2),
        },
        status : {
            type: DataTypes.ENUM(...Object.values(ReturnItemStatus)),
            allowNull: false
        },
        reviewedAt: {
            type: DataTypes.DATE
        },
        adminNote: {
            type: DataTypes.TEXT
        },
        createdAt: {
            type: DataTypes.DATE
        },
        deletedAt: {
            type: DataTypes.DATE
        }
    },
    {
        sequelize,
        modelName: "ReturnItem",
        createdAt: "createdAt",
        updatedAt: false,
        deletedAt: "deletedAt",
        paranoid: true,
        indexes: [
            {
                fields: ["returnRequestId"]
            },
            {
                fields: ["returnRequestId", "orderItemId"],
                unique: true
            }
        ]
    }
);