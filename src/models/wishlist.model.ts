import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/sequelize.config.js";
import { WishlistAttributes, WishlistCreationAttributes } from "../types/wishlist.interface.js";

const Wishlist = sequelize.define<Model<WishlistAttributes, WishlistCreationAttributes>, WishlistCreationAttributes>('Wishlist',
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
        variantId : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        addedAt : {
            type : DataTypes.DATE
        }
    },
    {
        createdAt : 'addedAt',
        updatedAt : false,
        indexes : [
            {
                fields : ['userId', 'variantId'],
                unique : true
            }
        ]
    }
)

export default Wishlist