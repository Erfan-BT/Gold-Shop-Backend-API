import { Optional } from "sequelize";

// Cart
export interface CartAttributes {
    id : number;
    userId : number;
    createdAt : Date;
    updatedAt : Date | null;
}

export interface CartCreationAttributes extends Optional<CartAttributes,
    'id' | 'createdAt' | 'updatedAt'
> {}

// Cart Items
export interface CartItemAttributes {
    id : number;
    cartId : number;
    variantId : number;
    quantity : number;
    addedAt : Date;
}

export interface CartItemCreationAttributes extends Optional<CartItemAttributes,
    'id' | 'addedAt'
> {}