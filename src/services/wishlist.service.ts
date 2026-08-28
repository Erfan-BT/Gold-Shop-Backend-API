import Wishlist from "../models/wishlist.model.js";
import productRepository from "../repository/product.repository.js";
import wishlistRepository from "../repository/wishlist.repository.js"
import { ConflictError, InternalServerError, NotFoundError } from "../utils/appError.js";

class WishlistService {
    async getWishlist (userId : number)
    : Promise<{
        rows: Wishlist[];
        count: number;
    }> {
        return await wishlistRepository.getWishlist(userId)
    }

    async addVariantToWishlist (userId : number, variantId : number)
    : Promise<Wishlist> {
        // Check Variant
        const variant = await productRepository.getVariant(variantId)
        if (!variant)
            throw new NotFoundError(`Product Variant Not Found { ID : ${variantId} }`)

        // Check Exists
        const existsWishlist = await wishlistRepository.ExistsWishlist(userId, variantId)
        if (existsWishlist)
            throw new ConflictError("Product Variant Already Exists In Wishlist");

        // Add To Wishlist
        return await wishlistRepository.addVariantToWishlist(userId, variantId)
    }

    async deleteVariantFromWishlist (userId : number, variantId : number)
    : Promise<void> {
        // Check Exists
        const existsWishlist = await wishlistRepository.ExistsWishlist(userId, variantId)
        if (!existsWishlist)
            throw new NotFoundError('Product Variant Not Exists In Wishlist');
        // Delete From Wishlist
        if ((await wishlistRepository.deleteVariantFromWishlist(userId, variantId)))
            throw new ConflictError('Product Variant Not Deleted From Wishlist')
        return
    }
}

export default new WishlistService()