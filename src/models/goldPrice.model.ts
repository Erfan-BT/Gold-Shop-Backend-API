import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/sequelize.config.js";
import { GoldPriceAttributes, GoldPriceCreationAttributes } from "../types/goldPrice.interface.js";
import { ProductKarat } from "../types/product.enum.js";

const GoldPrice = sequelize.define<Model<GoldPriceAttributes, GoldPriceCreationAttributes>, GoldPriceCreationAttributes>('GoldPrice',
    {
        id : {
            type : DataTypes.INTEGER,
            primaryKey : true,
            autoIncrement : true
        },
        karat : {
            type : DataTypes.ENUM(...Object.values(ProductKarat)),
            allowNull : false
        },
        pricePerGram : {
            type : DataTypes.DECIMAL(15, 2),
            allowNull : false
        },
        currencry : {
            type : DataTypes.CHAR(3),
            allowNull : false
        },
        effectiveDate : {
            type : DataTypes.DATE,
        }
    },
    {
        timestamps : false
    }
)

export default GoldPrice