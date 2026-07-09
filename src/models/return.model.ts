import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/sequelize.config.js";
import { ReturnItemAttributes, ReturnItemCreationAttributes, ReturnRequestAttributes, ReturnRequestCreationAttributes } from "../types/return.interface.js";
import { RefundStatus, ReturnStatus } from "../types/return.enum.js";

// Return Request
export const ReturnRequest = sequelize.define<Model<ReturnRequestAttributes, ReturnRequestCreationAttributes>, ReturnRequestCreationAttributes>('ReturnRequest',
    {
        id : {
            type : DataTypes.INTEGER,
            primaryKey : true,
            autoIncrement : true
        },
        orderId : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        reason : {
            type : DataTypes.STRING(50),
            allowNull : false
        },
        description : {
            type : DataTypes.TEXT,
            allowNull : false
        },
        status : {
            type : DataTypes.ENUM(...Object.values(ReturnStatus)),
            allowNull : false
        },
        reviewedBy : {
            type : DataTypes.INTEGER,
        },
        reviewedAt : {
            type : DataTypes.DATE,
        },
        adminNote : {
            type : DataTypes.TEXT,
        },
        refundAmount : {
            type : DataTypes.DECIMAL(15, 2),
        },
        refundStatus : {
            type : DataTypes.ENUM(...Object.values(RefundStatus)),
        },
        trackingCode : {
            type : DataTypes.STRING(100),
        },
        resolvedAt : {
            type : DataTypes.DATE,
        },
        createdAt : {
            type : DataTypes.DATE,
        },
        updatedAt : {
            type : DataTypes.DATE,
        },
        deletedAt : {
            type : DataTypes.DATE
        }
    },
    {
        createdAt : 'createdAt',
        updatedAt : 'updatedAt',
        deletedAt : 'deletedAt',
        paranoid : true,
        indexes : [
            {
                fields : ['orderId'],
            },
            {
                fields : ['status']
            }
        ]
    }
)

// Return Item
export const ReturnItem = sequelize.define<Model<ReturnItemAttributes, ReturnItemCreationAttributes>, ReturnItemCreationAttributes>('ReturnItem',
    {
        id : {
            type : DataTypes.INTEGER,
            primaryKey : true,
            autoIncrement : true
        },
        returnRequestId : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        orderItemId : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        quantity : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        refundAmount : {
            type : DataTypes.DECIMAL(15, 2),
            allowNull : false
        },
        createdAt : {
            type : DataTypes.DATE,
        },
        deletedAt : {
            type : DataTypes.DATE
        }
    },
    {
        createdAt : 'createdAt',
        updatedAt : false,
        deletedAt : 'deletedAt',
        paranoid : true,
        indexes : [
            {
                fields : ['returnRequestId']
            },
            {
                fields : ['returnRequestId', 'orderItemId'],
                unique : true
            }
        ]
    }
)