import {
    CreationOptional,
    DataTypes,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute
} from "sequelize";
import sequelize from "../configs/sequelize.config.js";
import { ProductKarat } from "../types/product.enum.js";
import { Category, ProductCategory } from "./category.model.js";
import Inventory from "./inventory.model.js";

// Product
export class Product extends Model<
    InferAttributes<Product>,
    InferCreationAttributes<Product>
> {

    declare id: CreationOptional<number>;

    declare title: string;

    declare slug: string;

    declare description: string;

    declare thumbnailImageId : CreationOptional<ForeignKey<ProductImage["id"]> | null>

    declare isActive: boolean;

    declare lowestPrice : number;

    declare soldCount : number;

    declare reviewCount : number;

    declare averageRating : number;

    declare createdAt: CreationOptional<Date>;

    declare updatedAt: CreationOptional<Date | null>;

    // Associations
    declare variants?: NonAttribute<ProductVariant[]>;
    declare categories?: NonAttribute<ProductCategory[]>;
    declare mainImage?: NonAttribute<ProductImage>;
}

Product.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        title: {
            type: DataTypes.STRING(200),
            allowNull: false
        },

        slug: {
            type: DataTypes.STRING(200),
            allowNull: false
        },

        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },

        thumbnailImageId : {
            type : DataTypes.INTEGER
        },

        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },

        lowestPrice : {
            type : DataTypes.DECIMAL(15, 2),
            allowNull : false
        },

        soldCount : {
            type : DataTypes.INTEGER,
            defaultValue : 0
        },

        reviewCount : {
            type : DataTypes.INTEGER,
            defaultValue : 0
        },

        averageRating : {
            type : DataTypes.DECIMAL(3, 2),
            defaultValue : 0
        },

        createdAt: {
            type: DataTypes.DATE
        },

        updatedAt: {
            type: DataTypes.DATE
        }
    },
    {
        sequelize,

        modelName: "Product",

        createdAt: "createdAt",

        updatedAt: "updatedAt",

        indexes: [
            {
                fields: ["title"]
            },
            {
                fields: ["slug"],
                unique: true
            }
        ]
    }
);

// Product Variant
export class ProductVariant extends Model<
    InferAttributes<ProductVariant>,
    InferCreationAttributes<ProductVariant>
> {

    declare id: CreationOptional<number>;

    declare productId: ForeignKey<Product["id"]>;

    declare weight: number;

    declare karat: ProductKarat;

    declare stoneType: string;

    declare color: string;

    declare sku: string;

    declare soldCount : number;

    declare currentPrice : number;

    declare isActive: boolean;

    declare createdAt: CreationOptional<Date>;

    // Associations
    declare product?: NonAttribute<Product>;

    declare inventory ?: NonAttribute<Inventory>;

    declare images?: NonAttribute<ProductImage[]>;

    declare prices?: NonAttribute<ProductPricing[]>;

    declare discounts?: NonAttribute<ProductDiscount[]>;
}

ProductVariant.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        productId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        weight: {
            type: DataTypes.DECIMAL(8, 3),
            allowNull: false
        },

        karat: {
            type: DataTypes.ENUM(...Object.values(ProductKarat)),
            allowNull: false
        },

        stoneType: {
            type: DataTypes.STRING(50),
            allowNull : false
        },

        color: {
            type: DataTypes.STRING(30),
            allowNull: false
        },

        sku: {
            type: DataTypes.STRING(50),
            allowNull: false
        },

        soldCount : {
            type : DataTypes.INTEGER,
            defaultValue : 0
        },

        currentPrice :{
            type : DataTypes.DECIMAL(15, 2),
            allowNull : false
        },

        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },

        createdAt: {
            type: DataTypes.DATE
        }
    },
    {
        sequelize,

        modelName: "ProductVariant",

        createdAt: "createdAt",

        updatedAt: false,

        indexes: [
            {
                fields: ["karat"]
            },
            {
                fields: ["sku"],
                unique: true
            }
        ]
    }
);

// Product Image
export class ProductImage extends Model<
    InferAttributes<ProductImage>,
    InferCreationAttributes<ProductImage>
> {

    declare id: CreationOptional<number>;

    declare variantId: ForeignKey<ProductVariant["id"]>;

    declare imageUrl: string;

    declare altText: string;

    declare isPrimary: boolean;

    declare sortOrder: number;

    declare fileName: string;

    declare createdAt: CreationOptional<Date>;

    // Associations
    declare variant?: NonAttribute<ProductVariant>;
}

ProductImage.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        variantId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        imageUrl: {
            type: DataTypes.TEXT,
            allowNull: false
        },

        altText: {
            type: DataTypes.STRING(200),
            allowNull: false
        },

        isPrimary: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },

        sortOrder: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        fileName: {
            type: DataTypes.STRING(255),
            allowNull: false
        },

        createdAt: {
            type: DataTypes.DATE
        }
    },
    {
        sequelize,

        modelName: "ProductImage",

        createdAt: "createdAt",

        updatedAt: false,

        indexes: [
            {
                fields: ["fileName"],
                unique: true
            },
            {
                fields: ["sortOrder", "variantId"],
                unique: true
            }
        ]
    }
);

// Product Pricing
export class ProductPricing extends Model<
    InferAttributes<ProductPricing>,
    InferCreationAttributes<ProductPricing>
> {

    declare id: CreationOptional<number>;

    declare variantId: ForeignKey<ProductVariant["id"]>;

    declare wageType: "fixed" | "percent";

    declare wageValue: number;

    declare profitType: "fixed" | "percent";

    declare profitValue: number;

    declare taxPercent: number;

    declare priority: number;

    declare validFrom: Date;

    declare validTo: Date | null;

    declare isActive: boolean;

    declare createdAt: CreationOptional<Date>;

    declare updatedAt: CreationOptional<Date | null>;

    // Associations
    declare variant?: NonAttribute<ProductVariant>;

    declare category?: NonAttribute<Category>;
}

ProductPricing.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        variantId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        wageType: {
            type: DataTypes.ENUM("fixed", "percent"),
            allowNull: false
        },

        wageValue: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },

        profitType: {
            type: DataTypes.ENUM("fixed", "percent"),
            allowNull: false
        },

        profitValue: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },

        taxPercent: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false
        },

        priority: {
            type: DataTypes.TINYINT
        },

        validFrom: {
            type: DataTypes.DATE,
            allowNull: false
        },

        validTo: {
            type: DataTypes.DATE,
            allowNull: true
        },

        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },

        createdAt: {
            type: DataTypes.DATE
        },

        updatedAt: {
            type: DataTypes.DATE
        }
    },
    {
        sequelize,

        modelName: "ProductPricing",

        createdAt: "createdAt",

        updatedAt: "updatedAt",

        indexes: [
            {
                fields: ["isActive"]
            }
        ]
    }
);


// Product Discount
export class ProductDiscount extends Model<
    InferAttributes<ProductDiscount>,
    InferCreationAttributes<ProductDiscount>
> {

    declare id: CreationOptional<number>;

    declare variantId: ForeignKey<ProductVariant["id"]>;

    declare type: "fixed" | "percent";

    declare value: number;

    declare startDate: Date;

    declare endDate: Date | null;

    declare isActive: boolean;

    // Associations
    declare variant?: NonAttribute<ProductVariant>;
}

ProductDiscount.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        variantId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        type: {
            type: DataTypes.ENUM("fixed", "percent"),
            allowNull: false
        },

        value: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },

        startDate: {
            type: DataTypes.DATE,
            allowNull: false
        },

        endDate: {
            type: DataTypes.DATE,
            allowNull: true
        },

        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    },
    {
        sequelize,

        modelName: "ProductDiscount",

        timestamps: false,

        indexes: [
            {
                fields: ["isActive"]
            }
        ]
    }
);