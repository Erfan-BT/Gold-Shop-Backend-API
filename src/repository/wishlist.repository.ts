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
            include : [
                {
                    model : ProductVariant,
                    as : 'variant',
                    required : false,
                    attributes : ['id', 'weight', 'karat', 'stoneType', 'color', 'isActive'],
                    include : [
                        {
                            model : Product,
                            as : 'product',
                            required : false,
                            attributes : ['id' ,'title', 'slug']
                        },
                        {
                            model : ProductImage,
                            as : 'images',
                            required : false,
                            where : {
                                isPrimary : true
                            },
                            attributes : ['imageUrl', 'altText', 'fileName']
                        }
                    ]
                }
            ]
        })
    }

    async createWishlist (userId : number, variantId : number)
    : Promise<Wishlist> {
        return await Wishlist.create({
            userId,
            variantId
        })
    }

    async deleteWishlist (userId : number, variantId : number)
    : Promise<number> {
        return await Wishlist.destroy({
            where : {
                userId,
                variantId
            }
        })
    }
}

export default new Wishlistrepository()