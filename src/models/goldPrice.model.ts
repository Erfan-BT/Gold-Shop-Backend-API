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
    declare isSalesEnabled : CreationOptional<boolean>;
    declare salesDisabledReason : CreationOptional<string | null>;
    declare salesDisabledAt : CreationOptional<Date | null>;

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
        },
        isSalesEnabled : {
            type : DataTypes.BOOLEAN,
            allowNull : false,
            defaultValue : true
        },
        salesDisabledReason : {
            type : DataTypes.STRING(200),
            allowNull : true,
            defaultValue : null
        },
        salesDisabledAt : {
            type : DataTypes.DATE,
            allowNull : true,
            defaultValue : null
        }
    },
    {
        sequelize,
        modelName: "GoldPrice",
        timestamps: false
    }
);

export default GoldPrice;