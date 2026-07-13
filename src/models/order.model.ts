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
import User from "./user.model.js";
import Address from "./address.model.js";
import Coupon from "./coupon.model.js";
import { ProductVariant } from "./product.model.js";
import {
    OrderPaymentStatus,
    OrderStatus,
    ShippingMethod
} from "../types/order.enum.js";

// Order
export class Order extends Model<
    InferAttributes<Order>,
    InferCreationAttributes<Order>
> {
    declare id: CreationOptional<number>;
    declare uuid: CreationOptional<string>;

    declare orderNumber: string;

    declare userId: ForeignKey<User["id"]>;
    declare addressId: ForeignKey<Address["id"]>;
    declare couponId: ForeignKey<Coupon["id"]> | null;

    declare altPhone: string;
    declare ipAddress: string;

    declare subtotal: number;
    declare discountAmount: number;

    declare shippingMethod: ShippingMethod;
    declare shippingCost: number;

    declare finalPrice: number;

    declare status: OrderStatus;
    declare paymentStatus: OrderPaymentStatus;

    declare shippedAt: Date | null;
    declare trackingCode: string | null;
    declare deliveredAt: Date | null;

    declare createdAt: CreationOptional<Date>;
    declare deletedAt: CreationOptional<Date | null>;

    // Associations
    declare user?: NonAttribute<User>;
    declare address?: NonAttribute<Address>;
    declare coupon?: NonAttribute<Coupon>;
    declare items?: NonAttribute<OrderItem[]>;
}

Order.init(
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
        orderNumber: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        altPhone: {
            type: DataTypes.STRING(15),
            allowNull: false
        },
        addressId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        ipAddress: {
            type: DataTypes.STRING(45),
            allowNull: false
        },
        subtotal: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false
        },
        discountAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false
        },
        shippingMethod: {
            type: DataTypes.ENUM(...Object.values(ShippingMethod)),
            allowNull: false
        },
        shippingCost: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false
        },
        couponId: {
            type: DataTypes.INTEGER
        },
        finalPrice: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM(...Object.values(OrderStatus)),
            allowNull: false
        },
        paymentStatus: {
            type: DataTypes.ENUM(...Object.values(OrderPaymentStatus)),
            allowNull: false
        },
        shippedAt: {
            type: DataTypes.DATE
        },
        trackingCode: {
            type: DataTypes.STRING(100)
        },
        deliveredAt: {
            type: DataTypes.DATE
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
        modelName: "Order",
        createdAt: "createdAt",
        updatedAt: false,
        deletedAt: "deletedAt",
        paranoid: true,
        indexes: [
            {
                fields: ["uuid"],
                unique: true
            },
            {
                fields: ["orderNumber"],
                unique: true
            },
            {
                fields: ["status"]
            },
            {
                fields: ["paymentStatus"]
            }
        ]
    }
);

// Order Item
export class OrderItem extends Model<
    InferAttributes<OrderItem>,
    InferCreationAttributes<OrderItem>
> {
    declare id: CreationOptional<number>;

    declare orderId: ForeignKey<Order["id"]>;
    declare variantId: ForeignKey<ProductVariant["id"]>;

    declare quantity: number;
    declare unitPrice: number;
    declare finalPrice: number;
    declare goldPriceAtTime: number;

    declare deletedAt: CreationOptional<Date | null>;

    // Associations
    declare order?: NonAttribute<Order>;
    declare variant?: NonAttribute<ProductVariant>;
}

OrderItem.init(
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
        variantId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        unitPrice: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false
        },
        finalPrice: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false
        },
        goldPriceAtTime: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false
        },
        deletedAt: {
            type: DataTypes.DATE
        }
    },
    {
        sequelize,
        modelName: "OrderItem",
        createdAt: false,
        updatedAt: false,
        deletedAt: "deletedAt",
        paranoid: true,
        indexes: [
            {
                fields: ["orderId", "variantId"],
                unique: true
            }
        ]
    }
);