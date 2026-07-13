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
import { ProductVariant } from "./product.model.js";

class Inventory extends Model<
    InferAttributes<Inventory>,
    InferCreationAttributes<Inventory>
> {
    declare id: CreationOptional<number>;

    declare variantId: ForeignKey<ProductVariant["id"]>;

    declare quantity: number;

    declare minThreshold: number;

    declare updatedAt: CreationOptional<Date | null>;

    // Associations

    declare variant?: NonAttribute<ProductVariant>;
}

Inventory.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        variantId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        minThreshold: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        updatedAt: {
            type: DataTypes.DATE
        }
    },
    {
        sequelize,
        modelName: "Inventory",
        createdAt: false,
        updatedAt: "updatedAt",
        indexes: [
            {
                fields: ["minThreshold"]
            },
            {
                fields: ["variantId"]
            }
        ]
    }
);

export default Inventory;