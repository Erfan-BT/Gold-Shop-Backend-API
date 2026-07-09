import { Optional } from "sequelize";

export interface AddressAttributes {
    id : number;
    userId : number;
    addressLine : string;
    city : string;
    postalCode : string;
    isDefault : boolean;
    createdAt : Date;
    deletedAt : Date;
}

export interface AddressCreationAttributes extends Optional<AddressAttributes,
    'id' | 'createdAt' | 'deletedAt'
> {}