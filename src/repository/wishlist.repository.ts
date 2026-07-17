import { Product, ProductImage, ProductVariant } from "../models/product.model.js"
import Wishlist from "../models/wishlist.model.js"

class Wishlistrepository {
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
}

export default new Wishlistrepository()