import { NextFunction, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import cartService from "../services/cart.service.js";

class CartController {
    async getCart (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
            const result = await cartService.getCart(userId)

            res.status(200).json({
                success : true,
                msg : 'Cart',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async addItem (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
            const { variantId, quantity } = req.validated.body
            const result = await cartService.getCart(userId)

            res.status(200).json({
                success : true,
                msg : 'Add CartItem',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new CartController()