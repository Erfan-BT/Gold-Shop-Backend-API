import Wishlist from "../models/wishlist.model.js";
import wishlistRepository from "../repository/wishlist.repository.js"

class WishlistService {
    async getWishlist (userId : number)
    : Promise<{
        rows: Wishlist[];
        count: number;
    }> {
        return await wishlistRepository.getWishlist(userId)
    }
}

export default new WishlistService()