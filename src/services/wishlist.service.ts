import Wishlist from "../models/wishlist.model.js";
import productRepository from "../repository/product.repository.js";
import wishlistRepository from "../repository/wishlist.repository.js"
import { ConflictError, NotFoundError } from "../utils/appError.js";

class WishlistService {
    async getWishlist (userId : number)
    : Promise<{
        rows: Wishlist[];
        count: number;
    }> {
        return await wishlistRepository.getWishlist(userId)
    }

    async createWishlist (userId : number, variantId : number)
    : Promise<Wishlist> {
        // Check Variant
        const variant = await productRepository.getVariant(variantId)
        if (!variant)
            throw new NotFoundError("Variant Not Found")
        // Check Exists
        const existsWishlist = await wishlistRepository.ExistsWishlist(userId, variantId)
        if (existsWishlist)
            throw new ConflictError("Variant Already Exists In Wishlist");
        // Create Wishlist
        return await wishlistRepository.createWishlist(userId, variantId)
    }
}

export default new WishlistService()