import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model
} from "sequelize";
import sequelize from "../configs/sequelize.config.js";
import { FluctuationStatus } from "../types/goldPrice.enum.js";

class GoldPrice extends Model<
    InferAttributes<GoldPrice>,
    InferCreationAttributes<GoldPrice>
> {
    declare id: CreationOptional<number>;
    declare pricePerGram18k: number;
    declare effectiveDate: CreationOptional<Date>;
    declare isAutoUpdateEnabled: boolean;
    declare source: CreationOptional<string>;
    declare fluctuationStatus : FluctuationStatus;
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
        },
        fluctuationStatus : {
            type : DataTypes.ENUM(...Object.values(FluctuationStatus)),
            defaultValue : FluctuationStatus.LOW,
            allowNull : false
        }
    },
    {
        sequelize,
        modelName: "GoldPrice",
        timestamps: false
    }
);

export default GoldPrice;