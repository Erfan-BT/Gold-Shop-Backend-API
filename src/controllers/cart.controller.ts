import { NextFunction, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import cartService from "../services/cart.service.js";
import { AddCartItemDto, QuantityDto } from "../validation/cart.validation.js";
import { VariantIdDto } from "../validation/product.validation.js";

class CartController {
    async getCart (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
            const result = await cartService.getCart(userId)

            res.status(200).json({
                success : true,
                msg : 'User Cart Successfully Found',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async addItemToCart (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
            const { variantId, quantity } = req.validated.body as AddCartItemDto
            await cartService.addItemToCart(userId, variantId, quantity)

            res.status(200).json({
                success : true,
                msg : 'Item Added To Cart Successfully',
                data : null
            })
        } catch (error) {
            next(error)
        }
    }

    async changeQuantity (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
            const { variantId } = req.validated.params as VariantIdDto
            const { quantity } = req.validated.body as QuantityDto
            await cartService.changeQuantity(userId, variantId, quantity)

            res.status(200).json({
                success : true,
                msg : 'Item Quantity Changed Successfully',
                data : null
            })
        } catch (error) {
            next(error)
        }
    }

    async deleteItemFromCart (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
            const { variantId } = req.validated.params as VariantIdDto
            await cartService.deleteItemFromCart(userId, variantId)

            res.status(200).json({
                success : true,
                msg : 'Item Deleted From Cart Successfully',
                data : null
            })
        } catch (error) {
            next(error)
        }
    }

    async clearCart (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
            await cartService.clearCart(userId)

            res.status(200).json({
                success : true,
                msg : 'Cart Cleared Successfully',
                data : null
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new CartController()