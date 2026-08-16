import { FindAndCountOptions, Op } from "sequelize";
import { Product, ProductDiscount, ProductImage, ProductPricing, ProductVariant } from "../models/product.model.js";
import Inventory from "../models/inventory.model.js";
import { Category, ProductCategory } from "../models/category.model.js";
import { CreateProductSchemaDto } from "../validation/product.validation.js";

class ProductRepository {
    async getProducts(options: FindAndCountOptions<Product>)
    : Promise<{
        rows: Product[];
        count: number;
    }> {
        return await Product.findAndCountAll(options);
    }

    async getProductBySlug (slug : string)
    : Promise<Product | null> {
        const now = new Date()
        return await Product.findOne({
            where : {
                slug,
                isActive : true
            },
            include : [
                {
                    model : ProductVariant,
                    as : 'variants',
                    required : true,
                    where : {
                        isActive : true
                    },
                    include : [
                        {
                            model : ProductImage,
                            as : 'images',
                            required : false,
                        },
                        {
                            model : Inventory,
                            as : 'inventory',
                            required : false,
                            attributes : ['quantity']
                        },
                        {
                            model : ProductDiscount,
                            as : 'discounts',
                            where: {
                                isActive: true,
                                startDate: {
                                    [Op.lte]: now
                                },
                                endDate: {
                                    [Op.gte]: now
                                }
                            },
                            required: false
                        },
                    ]
                }
            ],
            order: [
                [
                    { model: ProductVariant, as: "variants" },
                    "weight",
                    "ASC"
                ],
                [
                    { model: ProductVariant, as: "variants" },
                    { model: ProductImage, as: "images" },
                    "sortOrder",
                    "ASC"
                ]
            ]
        })
    }

    async getVariantBySlug (slug : string, variantId : number)
    : Promise<ProductVariant | null> {
        return await ProductVariant.findOne({
            where : {
                id : variantId,
                isActive : true
            },
            include : [
                {
                    model : Product,
                    as : 'product',
                    required : true,
                    where : {
                        slug,
                        isActive : true
                    },
                    attributes : []
                }
            ],
        })
    }

    async getVariant (variantId : number)
    : Promise<ProductVariant | null> {
        return await ProductVariant.findOne({
            where : {
                id : variantId,
                isActive : true
            },
            include : [
                {
                    model : Inventory,
                    as : 'inventory',
                    attributes : ['quantity']
                },
                {
                    model : Product,
                    as : 'product',
                    attributes : ['id', 'title'],
                    where : {
                        isActive : true
                    }
                }
            ]
        })
    }

    // ----- Admin -----
    async getProduct (productId : number)
    {
        return await Product.findOne({
            where : {
                id : productId
            }
        })
    }
    async getProductAdmin (productId : number)
    {
        return await Product.findOne({
            where : {
                id : productId
            },
            include : [
                {
                    model : ProductVariant,
                    as : 'variants',
                    required : false,
                    attributes: [
                        'id',
                        'sku',
                        'weight',
                        'karat',
                        'stoneType',
                        'color',
                        'soldCount',
                        'currentPrice',
                        'isActive',
                        'createdAt'
                    ],
                    include : [
                        {
                            model : ProductImage,
                            as : 'images',
                            attributes : ['id', 'imageUrl', 'altText', 'isPrimary', 'fileName', 'sortOrder'],
                            order: [['sortOrder', 'ASC']],
                            separate : true
                        },
                        {
                            model : ProductPricing,
                            as : 'prices',
                            attributes : [
                                'id',
                                'wageType',
                                'wageValue',
                                'profitType',
                                'profitValue',
                                'taxPercent',
                                'priority',
                                'validFrom',
                                'validTo',
                                'isActive'
                            ],
                            separate: true,
                            order: [
                                ['priority', 'ASC'],
                                ['validFrom', 'DESC']
                            ]
                        },
                        {
                            model : ProductDiscount,
                            as : 'discounts',
                            attributes : ['id', 'type', 'value', 'startDate', 'endDate', 'isActive'],
                            separate: true,
                            order: [
                                ['createdAt', 'DESC']
                            ]
                        },
                        {
                            model : Inventory,
                            as : 'inventory',
                            attributes : ['id', 'quantity', 'minThreshold']
                        }
                    ]
                },
                {
                    model : ProductCategory,
                    as : 'categories',
                    attributes : ['id'],
                    include : [
                        {
                            model : Category,
                            as : 'category',
                            attributes : ['id', 'title', 'slug', 'parentId', 'isActive']
                        }
                    ]
                }
            ]
        })
    }

    async createProduct (productData : CreateProductSchemaDto)
    {
        return await Product.create({
            ...productData,
            lowestPrice : 0,
            reviewCount : 0,
            averageRating : 0,
            soldCount : 0,
        })
    }

    async changeProduct (productId : number, data : Partial<Pick<Product, "title" | "slug" | "description">>)
    {
        const [rows] = await Product.update({
            ...data
        },{
            where : {
                id : productId
            }
        })
        return rows === 1 
    }

    async changeProductStatus (productId : number, currentStatus : boolean)
    {
        const [rows] = await Product.update({
            isActive : !currentStatus
        },{
            where : {
                id : productId,
                isActive : currentStatus
            }
        })
        return rows === 1 
    }

    async deleteProduct (productId : number)
    {
        const rows = await Product.destroy({
            where : {
                id : productId
            }
        })
        return rows === 1
    }
    // --- Variants ---
    async getProductVariants (productId : number)
    {
        return await ProductVariant.findAll({
            where : {
                productId
            },
            attributes : ['id' ,'weight', 'karat', 'stoneType', 'color', 'sku', 'soldCount', 'currentPrice', 'isActive'],
            include : [
                {
                    model : Inventory,
                    as : 'inventory',
                    attributes : ['quantity', 'minThreshold']
                }
            ],
            order: [
                ['id', 'ASC']
            ]
        })
    }

    async getProductVariant (productId : number, variantId : number)
    {
        return await ProductVariant.findOne({
            where : {
                productId,
                id : variantId
            },
            attributes : ['id' ,'weight', 'karat', 'stoneType', 'color', 'sku', 'soldCount', 'currentPrice', 'isActive', 'createdAt'],
            include : [
                {
                    model : ProductImage,
                    as : 'images',
                    attributes : ['id' ,'imageUrl', 'altText', 'isPrimary', 'sortOrder', 'fileName', 'createdAt'],
                    separate: true,
                    order : [
                        ['sortOrder', 'ASC']
                    ]
                },
                {
                    model : ProductPricing,
                    as : 'prices',
                    attributes : [
                        'id',
                        'wageType',
                        'wageValue',
                        'profitType',
                        'profitValue',
                        'taxPercent',
                        'priority',
                        'validFrom',
                        'validTo',
                        'isActive'
                    ],
                    separate: true,
                    order: [
                        ['priority', 'ASC'],
                        ['validFrom', 'DESC']
                    ]
                },
                {
                    model : ProductDiscount,
                    as : 'discounts',
                    attributes : ['id', 'type', 'value', 'startDate', 'endDate', 'isActive'],
                    separate: true,
                    order: [
                        ['createdAt', 'DESC']
                    ]
                },
                {
                    model : Inventory,
                    as : 'inventory',
                    attributes : ['quantity', 'minThreshold']
                }
            ]
        })
    }
}

export default new ProductRepository()