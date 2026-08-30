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
import { Order } from "./order.model.js";
import { PaymentStatus } from "../types/payment.enum.js";
import { ReturnRequest } from "./return.model.js";

class Payment extends Model<
    InferAttributes<Payment>,
    InferCreationAttributes<Payment>
> {
    declare id: CreationOptional<number>;
    declare uuid: CreationOptional<string>;

    declare orderId: ForeignKey<Order["id"]>;

    declare amount: number;
    declare transactionId: string;
    declare authorityCode: string;
    declare referenceCode: string;
    declare cardPan: string;
    declare status: PaymentStatus;
    declare ipAddress: string;

    declare refundAmount: CreationOptional<number | null>;
    declare refundReason: CreationOptional<string | null>;
    declare terminal_id: CreationOptional<string | null>
    declare refundId: CreationOptional<string | null>;

    declare returnRequestId : CreationOptional<ForeignKey<ReturnRequest['id']> | null>

    declare bankResponse: string;

    declare paidAt: CreationOptional<Date>;
    declare refundedAt: CreationOptional<Date | null>;
    declare updatedAt: CreationOptional<Date | null>;
    declare deletedAt: CreationOptional<Date | null>;

    // Associations
    declare returnRequest?: NonAttribute<ReturnRequest>;
}

Payment.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        uuid: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        orderId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        amount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false
        },
        transactionId: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        authorityCode: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        referenceCode: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        cardPan: {
            type: DataTypes.STRING(16),
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM(...Object.values(PaymentStatus)),
            allowNull: false
        },
        ipAddress: {
            type: DataTypes.STRING(45),
            allowNull: false
        },
        refundAmount: {
            type: DataTypes.DECIMAL(15, 2)
        },
        refundReason: {
            type: DataTypes.TEXT
        },
        terminal_id : {
            type : DataTypes.STRING()
        },
        refundId: {
            type: DataTypes.STRING()
        },
        returnRequestId : {
            type : DataTypes.INTEGER
        },
        bankResponse: {
            type: DataTypes.STRING,
            allowNull: false
        },
        paidAt: {
            type: DataTypes.DATE
        },
        refundedAt: {
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
        modelName: "Payment",
        createdAt: "paidAt",
        updatedAt: "updatedAt",
        deletedAt: "deletedAt",
        paranoid: true,
        indexes: [
            {
                fields: ["uuid"],
                unique: true
            },
            {
                fields: ["transactionId"],
                unique: true
            },
            {
                fields: ["authorityCode"],
                unique: true
            },
            {
                fields: ["status"]
            }
        ]
    }
);

export default Payment;