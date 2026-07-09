import { Optional } from "sequelize";

export interface WishlistAttributes {
    id : number;
    userId : number;
    variantId : number;
    addedAt : Date;
}

export interface WishlistCreationAttributes extends Optional<WishlistAttributes,
    'id' | 'addedAt'
> {}