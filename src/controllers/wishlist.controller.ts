import { NextFunction, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import wishlistService from "../services/wishlist.service.js";
import { VariantIdDto } from "../validation/product.validation.js";

class WishlistController {
    async getWishlist (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
            const result = await wishlistService.getWishlist(userId)

            res.status(200).json({
                success : true,
                msg : 'User Wishlist Successfully Found',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async addVariantToWishlist (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
            const { variantId } = req.validated.body as VariantIdDto
            const result = await wishlistService.addVariantToWishlist(userId, variantId)

            res.status(200).json({
                success : true,
                msg : 'Product Variant Added To Wishlist Successfully',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async deleteVariantFromWishlist (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
            const { variantId } = req.validated.params as VariantIdDto
            await wishlistService.deleteVariantFromWishlist(userId, variantId)

            res.status(200).json({
                success : true,
                msg : 'Product Variant Deleted From Wishlist Successfully',
                data : null
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new WishlistController()