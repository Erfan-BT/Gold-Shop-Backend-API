import { Op, Transaction } from "sequelize"
import { Cart, CartItem } from "../models/cart.model.js"
import Inventory from "../models/inventory.model.js"
import { Product, ProductDiscount, ProductImage, ProductVariant } from "../models/product.model.js"

class CartRepository {
    async getCart (userId : number)
    : Promise<Cart | null> {
        const now = new Date()
        return await Cart.findOne({
            where : {
                userId
            },
            attributes : [],
            include : [
                {
                    model : CartItem,
                    as : 'items',
                    include : [
                        {
                            model : ProductVariant,
                            as : 'variant',
                            required : true,
                            attributes : ['id', 'weight', 'karat', 'stoneType', 'color', 'currentPrice'],
                            where : {
                                isActive : true
                            },
                            include : [
                                {
                                    model : Product,
                                    as : 'product',
                                    required : true,
                                    attributes : ['id', 'title', 'slug'],
                                    where : {
                                        isActive : true
                                    }
                                },
                                {
                                    model : Inventory,
                                    as : 'inventory',
                                    required : true,
                                    attributes : ['quantity', 'minTreshold']
                                },
                                {
                                    model : ProductImage,
                                    as : 'images',
                                    required : false,
                                    attributes : ['id' ,'imageUrl', 'altText', 'fileName'],
                                    where : {
                                        isPrimary : true
                                    }
                                },
                                {
                                    model : ProductDiscount,
                                    as : 'discounts',
                                    attributes : ['id', 'type', 'value', 'startDate', 'endDate'],
                                    where: {
                                        isActive: true,
                                        startDate: {
                                            [Op.lte]: now
                                        },
                                        endDate: {
                                            [Op.gte]: now
                                        }
                                    },
                                    required: false
                                },
                            ]
                        }
                    ]
                }
            ],
            order: [
                [{ model: CartItem, as: "items" }, "addedAt", "ASC"]
            ]
        })
    }

    async findUserCart (userId : number)
    : Promise<Cart | null> {
        return await Cart.findOne({
            where : {
                userId
            }
        })
    }

    async findOrCreateCart (userId : number)
    : Promise<[Cart, boolean]> {
        return await Cart.findOrCreate({
            where : {
                userId
            },
            defaults : {
                userId
            }
        })
    }

    async findUserCartItem (userId : number, variantId : number)
    : Promise<CartItem | null> {
        return await CartItem.findOne({
            where : {
                variantId
            },
            include : [{
                model : Cart,
                as : 'cart',
                required : true,
                attributes : [],
                where : {
                    userId
                }
            }]
        })
    }

    async addItemToCart (cartId : number, variantId : number, quantity : number)
    : Promise<CartItem> {
        return await CartItem.create({
            cartId,
            variantId,
            quantity
        })
    }

    async setItemQuantity (itemId : number, oldQuantity : number, newQuantity : number)
    : Promise<boolean> {
        const [rows] = await CartItem.update({
            quantity : newQuantity
        },
        {
            where :{
                id : itemId,
                quantity : oldQuantity
            }
        })
        return rows === 1
    }

    async deleteItemFromCart (itemId : number)
    : Promise<boolean> {
        const rows = await CartItem.destroy({
            where : {
                id : itemId,
            }
        })
        return rows === 1
    }

    async clearCart (cartId : number, transaction : Transaction | null = null)
    : Promise<number> {
        return await CartItem.destroy({
            where : {
                cartId
            },
            transaction
        })
    }
}

export default new CartRepository()