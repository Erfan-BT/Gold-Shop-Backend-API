import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model
} from "sequelize";
import sequelize from "../configs/sequelize.config.js";

class GoldPrice extends Model<
    InferAttributes<GoldPrice>,
    InferCreationAttributes<GoldPrice>
> {
    declare id: CreationOptional<number>;
    declare pricePerGram18k: number;
    declare effectiveDate: CreationOptional<Date>;
    declare isAutoUpdateEnabled: boolean;
    declare source: CreationOptional<string>;
}

GoldPrice.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        pricePerGram18k: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false
        },
        effectiveDate: {
            type: DataTypes.DATE
        },
        isAutoUpdateEnabled : {
            type : DataTypes.BOOLEAN,
            defaultValue : true
        },
        source : {
            type : DataTypes.STRING(),
            defaultValue: "external-api"
        }
    },
    {
        sequelize,
        modelName: "GoldPrice",
        timestamps: false
    }
);

export default GoldPrice;