import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/sequelize.config.js";
import { ProductAttributes, ProductCreationAttributes, ProductDiscountAttributes, ProductDiscountCreationAttributes, ProductImageAttributes, ProductImageCreationAttributes, ProductPricingAttributes, ProductPricingCreationAttributes, ProductVariantAttributes, ProductVariantCreationAttributes } from "../types/product.interface.js";
import { ProductKarat } from "../types/product.enum.js";

// Product
export const Product = sequelize.define<Model<ProductAttributes, ProductCreationAttributes>, ProductCreationAttributes>('Product',
    {
        id : {
            type : DataTypes.INTEGER,
            primaryKey : true,
            autoIncrement : true
        },
        title : {
            type : DataTypes.STRING(200),
            allowNull : false
        },
        slug : {
            type : DataTypes.STRING(200),
            allowNull : false
        },
        description : {
            type : DataTypes.TEXT,
            allowNull : false
        },
        isActive : {
            type : DataTypes.BOOLEAN,
            allowNull : false
        },
        createdAt : {
            type : DataTypes.DATE
        },
        updatedAt : {
            type : DataTypes.DATE
        }
    },
    {
        createdAt : 'createdAt',
        updatedAt : 'updatedAt',
        indexes : [
            {
                fields : ['title']
            },
            {
                fields : ['slug'],
                unique : true
            }
        ]
    }
)
// Product Variant
export const ProductVariant = sequelize.define<Model<ProductVariantAttributes, ProductVariantCreationAttributes>, ProductVariantCreationAttributes>('ProductVariant',
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
        weight : {
            type : DataTypes.DECIMAL(8, 3),
            allowNull : false
        },
        karat : {
            type : DataTypes.ENUM(...Object.values(ProductKarat)),
            allowNull : false
        },
        stoneType : {
            type : DataTypes.STRING(50),
        },
        color : {
            type : DataTypes.STRING(30),
            allowNull : false
        },
        sku : {
            type : DataTypes.STRING(50),
            allowNull : false
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
                fields : ['karat']
            },
            {
                fields : ['sku'],
                unique : true
            }
        ]
    }
)
// Product Image
export const ProductImage = sequelize.define<Model<ProductImageAttributes, ProductImageCreationAttributes>, ProductImageCreationAttributes>('ProductImage',
    {
        id : {
            type : DataTypes.INTEGER,
            primaryKey : true,
            autoIncrement : true
        },
        variantId : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        imageUrl : {
            type : DataTypes.TEXT,
            allowNull : false
        },
        altText : {
            type : DataTypes.STRING(200),
            allowNull : false
        },
        isPrimary : {
            type : DataTypes.BOOLEAN,
            allowNull : false
        },
        sortOrder : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        fileName : {
            type : DataTypes.STRING(255),
            allowNull : false
        },
        createdAt : {
            type : DataTypes.DATE
        }
    },
    {
        createdAt : 'createdAt',
        updatedAt : false,
        indexes : [
            {
                fields : ['fileName'],
                unique : true
            },
            {
                fields : ['sortOrder', 'variantId'],
                unique : true
            }
        ]
    }
)
// Product Pricing
export const ProductPricing = sequelize.define<Model<ProductPricingAttributes, ProductPricingCreationAttributes>, ProductPricingCreationAttributes>('ProductPricing',
    {
        id : {
            type : DataTypes.INTEGER,
            primaryKey : true,
            autoIncrement : true
        },
        variantId : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        categoryId : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        wageType : {
            type : DataTypes.ENUM('fixed', 'percent'),
            allowNull : false
        },
        wageValue : {
            type : DataTypes.DECIMAL(10, 2),
            allowNull : false
        },
        profitType : {
            type : DataTypes.ENUM('fixed', 'percent'),
            allowNull : false
        },
        profitValue : {
            type : DataTypes.DECIMAL(10, 2),
            allowNull : false
        },
        taxPercent : {
            type : DataTypes.DECIMAL(5, 2),
            allowNull : false
        },
        priority : {
            type : DataTypes.TINYINT // 1 : By Variant Id, 2 : By Category Id
        },
        validFrom : {
            type : DataTypes.DATE,
            allowNull : false
        },
        validTo : {
            type : DataTypes.DATE,
            allowNull : false
        },
        isActive : {
            type : DataTypes.BOOLEAN,
            allowNull : false
        },
        createdAt : {
            type : DataTypes.DATE
        },
        updatedAt : {
            type : DataTypes.DATE
        }
    },
    {
        createdAt : 'createdAt',
        updatedAt : 'updatedAt',
        indexes : [
            {
                fields : ['isActive']
            }
        ]
    }
)
// Product Discount
export const ProductDiscount = sequelize.define<Model<ProductDiscountAttributes, ProductDiscountCreationAttributes>, ProductDiscountCreationAttributes>('ProductDiscount',
    {
        id : {
            type : DataTypes.INTEGER,
            primaryKey : true,
            autoIncrement : true
        },
        variantId : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        type : {
            type : DataTypes.ENUM('fixed', 'percent'),
            allowNull : false
        },
        value : {
            type : DataTypes.DECIMAL(10, 2),
            allowNull : false
        },
        startDate : {
            type : DataTypes.DATE,
            allowNull : false
        },
        endDate : {
            type : DataTypes.DATE,
            allowNull : false
        },
        isActive : {
            type : DataTypes.BOOLEAN,
            allowNull : false
        }
    },
    {
        timestamps : false,
        indexes : [
            {
                fields : ['isActive']
            }
        ]
    }
)