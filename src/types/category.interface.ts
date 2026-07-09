import { Optional } from "sequelize";

// Category
export interface CategoryAttributes {
    id : number;
    title : string;
    slug : string;
    parentId : number | null;
    isActive : boolean;
    createdAt : Date;
}

export interface CategoryCreationAttributes extends Optional<CategoryAttributes, 
    'id' | 'createdAt'
> {}

// Product Category
export interface ProductCategoryAttributes {
    id : number;
    productId : number;
    categoryId : number;
}

export interface ProductCategoryCreationAttributes extends Optional<ProductCategoryAttributes ,
    'id'
> {}