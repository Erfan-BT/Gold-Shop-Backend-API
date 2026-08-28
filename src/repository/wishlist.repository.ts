import Inventory from "../models/inventory.model.js";
import { Product, ProductImage, ProductVariant } from "../models/product.model.js"
import Wishlist from "../models/wishlist.model.js"

class Wishlistrepository {
    async ExistsWishlist (userId : number, variantId : number)
    : Promise<Wishlist | null> {
        return (await Wishlist.findOne({
            where : {
                userId,
                variantId
            }
        }))
    }

    async getWishlist (userId : number)
    : Promise<{
        rows: Wishlist[];
        count: number;
    }> {
        return await Wishlist.findAndCountAll({
            where : {
                userId
            },
            attributes : ['addedAt'],
            include : [
                {
                    model : ProductVariant,
                    as : 'variant',
                    required : true,
                    attributes : [
                        'id',
                        'weight',
                        'karat',
                        'stoneType',
                        'color',
                        'currentPrice',
                        'isActive',
                    ],
                    include : [
                        {
                            model : Product,
                            as : 'product',
                            required : true,
                            attributes : [
                                'id',
                                'title',
                                'slug',
                                'isActive',
                                'lowestPrice',
                                'averageRating',
                            ]
                        },
                        {
                            model : ProductImage,
                            as : 'images',
                            required : false,
                            where : {
                                isPrimary : true
                            },
                            attributes : [
                                'id',
                                'imageUrl',
                                'altText',
                                'fileName',
                            ]
                        },
                        {
                            model : Inventory,
                            as : 'inventory',
                            required : true,
                            attributes : ['qauntity', 'minThreshold']
                        }
                    ]
                }
            ]
        })
    }

    async addVariantToWishlist (userId : number, variantId : number)
    : Promise<Wishlist> {
        return await Wishlist.create({
            userId,
            variantId
        })
    }

    async deleteVariantFromWishlist (userId : number, variantId : number)
    : Promise<boolean> {
        const rows = await Wishlist.destroy({
            where : {
                userId,
                variantId
            }
        })
        return rows === 1
    }
}

export default new Wishlistrepository()