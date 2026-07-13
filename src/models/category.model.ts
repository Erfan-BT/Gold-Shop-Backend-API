import {
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    Model
} from "sequelize";
import sequelize from "../configs/sequelize.config.js";

// Category
export class Category extends Model<
    InferAttributes<Category>,
    InferCreationAttributes<Category>
> {
    declare id: CreationOptional<number>;

    declare title: string;
    declare slug: string;
    declare parentId: number | null;
    declare isActive: boolean;

    declare createdAt: CreationOptional<Date>;
}

Category.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        slug: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        parentId: {
            type: DataTypes.INTEGER,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
        },
    },
    {
        sequelize,
        modelName: "Category",
        createdAt: "createdAt",
        updatedAt: false,
        indexes: [
            {
                fields: ["slug"],
                unique: true,
            },
            {
                fields: ["title"],
            },
        ],
    }
);

// Product Category
export class ProductCategory extends Model<
    InferAttributes<ProductCategory>,
    InferCreationAttributes<ProductCategory>
> {
    declare id: CreationOptional<number>;

    declare productId: number;
    declare categoryId: number;
}

ProductCategory.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        productId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: "ProductCategory",
        timestamps: false,
        indexes: [
            {
                fields: ["productId", "categoryId"],
                unique: true,
            },
        ],
    }
);