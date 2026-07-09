import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/sequelize.config.js";
import { CartAttributes, CartCreationAttributes, CartItemAttributes, CartItemCreationAttributes } from "../types/cart.interface.js";

// Cart
export const Cart = sequelize.define<Model<CartAttributes, CartCreationAttributes>, CartCreationAttributes>('Cart',
    {
        id : {
            type : DataTypes.INTEGER,
            primaryKey : true,
            autoIncrement : true
        },
        userId : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        createdAt : {
            type : DataTypes.DATE
        },
        updatedAt : {
            type : DataTypes.DATE
        }
    },
    {
        createdAt : 'createdAt',
        updatedAt : 'updatedAt',
        indexes : [
            {
                fields : ['userId'],
                unique : true
            }
        ]
    }
)

// Cart Item
export const CartItem = sequelize.define<Model<CartItemAttributes, CartItemCreationAttributes>, CartItemCreationAttributes>('CartItem',
    {
        id : {
            type : DataTypes.INTEGER,
            primaryKey : true,
            autoIncrement : true
        },
        cartId : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        variantId : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        quantity :{ 
            type : DataTypes.INTEGER,
            allowNull : false
        },
        addedAt : {
            type : DataTypes.DATE,
        }
    },
    {
        createdAt : 'addedAt',
        updatedAt : false,
        indexes : [
            {
                fields : ['cartId', 'variantId'],
                unique : true
            }
        ]
    }
)