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
import User from "../models/user.model.js";
import { ProductVariant } from "../models/product.model.js";

class Wishlist extends Model<
    InferAttributes<Wishlist>,
    InferCreationAttributes<Wishlist>
> {
    declare id: CreationOptional<number>;

    declare userId: ForeignKey<User["id"]>;

    declare variantId: ForeignKey<ProductVariant["id"]>;

    declare addedAt: CreationOptional<Date>;

    // Associations
    declare user?: NonAttribute<User>;
    
    declare variant?: NonAttribute<ProductVariant>;
}

Wishlist.init(
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
        variantId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        addedAt: {
            type: DataTypes.DATE
        }
    },
    {
        sequelize,
        modelName: "Wishlist",
        createdAt: "addedAt",
        updatedAt: false,
        indexes: [
            {
                fields: ["userId", "variantId"],
                unique: true
            }
        ]
    }
);

export default Wishlist;