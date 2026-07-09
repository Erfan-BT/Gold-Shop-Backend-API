import { Optional } from "sequelize";

export interface GoldPriceAttributes {
    id : number;
    karat : string;
    pricePerGram : number;
    currencry : string;
    effectiveDate : Date;
}

export interface GoldPriceCreationAttributes extends Optional<GoldPriceAttributes,
    'id' | 'effectiveDate'
> {}