import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model
} from "sequelize";
import sequelize from "../configs/sequelize.config.js";
import { ProductKarat } from "../types/product.enum.js";

class GoldPrice extends Model<
    InferAttributes<GoldPrice>,
    InferCreationAttributes<GoldPrice>
> {
    declare id: CreationOptional<number>;
    declare karat: ProductKarat;
    declare pricePerGram: number;
    declare currency: string;
    declare effectiveDate: CreationOptional<Date>;
}

GoldPrice.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        karat: {
            type: DataTypes.ENUM(...Object.values(ProductKarat)),
            allowNull: false
        },
        pricePerGram: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false
        },
        currency: {
            type: DataTypes.CHAR(3),
            allowNull: false
        },
        effectiveDate: {
            type: DataTypes.DATE
        }
    },
    {
        sequelize,
        modelName: "GoldPrice",
        timestamps: false
    }
);

export default GoldPrice;