import {
    CreationOptional,
    DataTypes,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model
} from "sequelize";
import sequelize from "../configs/sequelize.config.js";
import { Order , OrderItem } from "./order.model.js";
import User from "./user.model.js";
import { RefundStatus, ReturnStatus } from "../types/return.enum.js";

// Return Request
export class ReturnRequest extends Model<
    InferAttributes<ReturnRequest>,
    InferCreationAttributes<ReturnRequest>
> {
    declare id: CreationOptional<number>;

    declare orderId: ForeignKey<Order["id"]>;

    declare reason: string;
    declare description: string;
    declare status: ReturnStatus;

    declare reviewedBy: CreationOptional<ForeignKey<User["id"]> | null>;
    declare reviewedAt: CreationOptional<Date | null>;
    declare adminNote: CreationOptional<string | null>;

    declare refundAmount: CreationOptional<number | null>;
    declare refundStatus: CreationOptional<RefundStatus | null>;

    declare trackingCode: CreationOptional<string | null>;
    declare resolvedAt: CreationOptional<Date | null>;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date | null>;
    declare deletedAt: CreationOptional<Date | null>;
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
        reason: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
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
        trackingCode: {
            type: DataTypes.STRING(100)
        },
        resolvedAt: {
            type: DataTypes.DATE
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

    declare quantity: number;
    declare refundAmount: number;

    declare createdAt: CreationOptional<Date>;
    declare deletedAt: CreationOptional<Date | null>;
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
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        refundAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false
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