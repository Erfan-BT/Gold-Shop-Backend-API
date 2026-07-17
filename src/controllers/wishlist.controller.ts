import { NextFunction, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import wishlistService from "../services/wishlist.service.js";

class WishlistController {
    async getWishlist (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
            const result = await wishlistService.getWishlist(userId)

            res.status(200).json({
                success : true,
                msg : 'Wishlists',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async createWishlist (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
            const { variantId } = req.validated.body
            const result = await wishlistService.createWishlist(userId, Number(variantId))

            res.status(200).json({
                success : true,
                msg : 'Create Wishlist',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async deleteWishlist (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
            const { variantId } = req.validated.params
            await wishlistService.deleteWishlist(userId, Number(variantId))

            res.status(200).json({
                success : true,
                msg : 'Delete Wishlist',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new WishlistController()