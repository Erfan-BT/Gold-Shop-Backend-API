import { Optional } from "sequelize";

export interface InventoryAttributes {
    id : number;
    variantId : number;
    quantity : number;
    minThershold : number;
    updatedAt : Date | null;
}

export interface InventoryCreationAttributes extends Optional<InventoryAttributes,
    'id' | 'updatedAt'
> {}