import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/sequelize.config.js";
import { OrderAttributes, OrderCreationAttributes, OrderItemAttributes, OrderItemCreationAttributes } from "../types/order.interface.js";
import { OrderPaymentStatus, OrderStatus, ShippingMethod } from "../types/order.enum.js";

// Order
export const Order = sequelize.define<Model<OrderAttributes, OrderCreationAttributes>, OrderCreationAttributes>('Order',
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
        orderNumber : {
            type : DataTypes.STRING(50),
            allowNull : false
        },
        userId : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        altPhone : {
            type : DataTypes.STRING(15),
            allowNull : false
        },
        addressId : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        ipAddress : {
            type : DataTypes.STRING(45),
            allowNull : false
        },
        subtotal : {
            type : DataTypes.DECIMAL(15, 2),
            allowNull : false
        },
        discountAmount : {
            type : DataTypes.DECIMAL(15, 2),
            allowNull : false
        },
        shippingMethod : {
            type : DataTypes.ENUM(...Object.values(ShippingMethod)),
            allowNull : false
        },
        shippingCost : {
            type : DataTypes.DECIMAL(15, 2),
            allowNull : false
        },
        couponId : {
            type : DataTypes.INTEGER,
        },
        finalPrice : {
            type : DataTypes.DECIMAL(15, 2),
            allowNull : false
        },
        status : {
            type : DataTypes.ENUM(...Object.values(OrderStatus)),
            allowNull : false
        },
        paymentStatus : {
            type : DataTypes.ENUM(...Object.values(OrderPaymentStatus)),
            allowNull : false
        },
        shippedAt : {
            type : DataTypes.DATE,
        },
        trackingCode : {
            type : DataTypes.STRING(100),
        },
        deliveredAt : {
            type : DataTypes.DATE,
        },
        createdAt : {
            type : DataTypes.DATE,
        },
        deletedAt : {
            type : DataTypes.DATE,
        }
    },
    {
        createdAt : 'createdAt',
        updatedAt : false,
        deletedAt : 'deletedAt',
        paranoid : true,
        indexes : [
            {
                fields : ['uuid'],
                unique : true
            },
            {
                fields : ['orderNumber'],
                unique : true
            },
            {
                fields : ['status']
            },
            {
                fields : ['paymentStatus']
            }
        ]
    }
)

// Order Item
export const OrderItem = sequelize.define<Model<OrderItemAttributes, OrderItemCreationAttributes>, OrderItemCreationAttributes>('OrderItem',
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
        variantId : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        quantity : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        unitPrice : {
            type : DataTypes.DECIMAL(15, 2),
            allowNull : false
        },
        finalPrice : {
            type : DataTypes.DECIMAL(15, 2),
            allowNull : false
        },
        goldPriceAtTime : {
            type : DataTypes.DECIMAL(15, 2),
            allowNull : false
        },
        deletedAt : {
            type : DataTypes.DATE,
        }
    },
    {
        createdAt : false,
        updatedAt : false,
        deletedAt : 'deletedAt',
        paranoid : true,
        indexes : [
            {
                fields : ['orderId', 'variantId'],
                unique : true
            }
        ]
    }
)