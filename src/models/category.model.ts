import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/sequelize.config.js";
import { CategoryAttributes, CategoryCreationAttributes, ProductCategoryAttributes, ProductCategoryCreationAttributes } from "../types/category.interface.js";

export const Category = sequelize.define<Model<CategoryAttributes, CategoryCreationAttributes>, CategoryCreationAttributes>('Category',
    {
        id : {
            type : DataTypes.INTEGER,
            primaryKey : true,
            autoIncrement : true
        },
        title : {
            type : DataTypes.STRING(100),
            allowNull : false
        },
        slug : {
            type : DataTypes.STRING(100),
            allowNull : false
        },
        parentId : {
            type : DataTypes.INTEGER,
        },
        isActive : {
            type : DataTypes.BOOLEAN,
            allowNull : false
        },
        createdAt : {
            type : DataTypes.DATE,
        }
    },
    {
        createdAt : 'createdAt',
        updatedAt : false,
        indexes : [
            {
                fields : ['slug'],
                unique : true
            },
            {
                fields : ['title']
            }
        ]
    }
)

export const ProductCategory = sequelize.define<Model<ProductCategoryAttributes, ProductCategoryCreationAttributes>, ProductCategoryCreationAttributes>('ProductCategory',
    {
        id : {
            type : DataTypes.INTEGER,
            primaryKey : true,
            autoIncrement : true
        },
        productId : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        categoryId : {
            type : DataTypes.INTEGER,
            allowNull : false
        }
    },
    {
        timestamps : false,
        indexes : [
            {
                fields : ['productId', 'categoryId'],
                unique : true
            }
        ]
    }
)