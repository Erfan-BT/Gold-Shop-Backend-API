import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/sequelize.config.js";
import { PaymentAttributes, PaymentCreationAttributes } from "../types/payment.interface.js";
import { PaymentStatus } from "../types/payment.enum.js";

const Payment = sequelize.define<Model<PaymentAttributes, PaymentCreationAttributes>, PaymentCreationAttributes>('Payment',
    {
        id : {
            type : DataTypes.INTEGER,
            primaryKey : true,
            autoIncrement : true
        },
        uuid : {
            type : DataTypes.UUID,
            defaultValue : DataTypes.UUIDV4
        },
        orderId : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        amount : {
            type : DataTypes.DECIMAL(15, 2),
            allowNull : false
        },
        treansactionId : {
            type : DataTypes.STRING(100),
            allowNull : false
        },
        authorityCode : {
            type : DataTypes.STRING(100),
            allowNull : false
        },
        refernceCode : {
            type : DataTypes.STRING(100),
            allowNull : false
        },
        cardPan : {
            type : DataTypes.STRING(16),
            allowNull : false
        },
        status : {
            type : DataTypes.ENUM(...Object.values(PaymentStatus)),
            allowNull : false
        },
        ipAddress : {
            type : DataTypes.STRING(45),
            allowNull : false
        },
        refundAmount : {
            type : DataTypes.DECIMAL(15, 2),
        },
        refundReason : {
            type : DataTypes.TEXT,
        },
        refundId : {
            type : DataTypes.INTEGER,
        },
        bankResponse : {
            type : DataTypes.STRING,
            allowNull : false
        },
        paidAt : {
            type : DataTypes.DATE,
        },
        refundedAt : {
            type : DataTypes.DATE,
        },
        updatedAt : {
            type : DataTypes.DATE,
        },
        deletedAt : {
            type : DataTypes.DATE,
        }
    },
    {
        createdAt : 'paidAt',
        updatedAt : 'updatedAt',
        deletedAt : 'deletedAt',
        paranoid : true,
        indexes : [
            {
                fields : ['uuid'],
                unique : true
            },
            {
                fields : ['treansactionId'],
                unique : true
            },
            {
                fields : ['authorityCode'],
                unique : true
            },
            {
                fields : ['status']
            }
        ]
    }
)

export default Payment