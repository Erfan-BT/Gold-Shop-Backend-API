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
import { ProductVariant } from "./product.model.js";

// Cart
export class Cart extends Model<
    InferAttributes<Cart>,
    InferCreationAttributes<Cart>
> {
    declare id: CreationOptional<number>;

    declare userId: ForeignKey<User["id"]>;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date | null>;

    // Associations
    declare user?: NonAttribute<User>;
    declare items?: NonAttribute<CartItem[]>;
}

Cart.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE
        },
        updatedAt: {
            type: DataTypes.DATE
        }
    },
    {
        sequelize,
        modelName: "Cart",
        createdAt: "createdAt",
        updatedAt: "updatedAt",
        indexes: [
            {
                fields: ["userId"],
                unique: true
            }
        ]
    }
);

// Cart Item
export class CartItem extends Model<
    InferAttributes<CartItem>,
    InferCreationAttributes<CartItem>
> {
    declare id: CreationOptional<number>;

    declare cartId: ForeignKey<Cart["id"]>;
    declare variantId: ForeignKey<ProductVariant["id"]>;

    declare quantity: number;

    declare addedAt: CreationOptional<Date>;

    // Associations
    declare cart?: NonAttribute<Cart>;
    declare variant?: NonAttribute<ProductVariant>;
}

CartItem.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        cartId: {
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
        addedAt: {
            type: DataTypes.DATE
        }
    },
    {
        sequelize,
        modelName: "CartItem",
        createdAt: "addedAt",
        updatedAt: false,
        indexes: [
            {
                fields: ["cartId", "variantId"],
                unique: true
            }
        ]
    }
);