import { FindAndCountOptions, Op } from "sequelize";
import { Product, ProductDiscount, ProductImage, ProductPricing, ProductVariant } from "../models/product.model.js";
import Inventory from "../models/inventory.model.js";

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
                }
            ]
        })
    }
}

export default new ProductRepository()