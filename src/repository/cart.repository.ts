import { Op } from "sequelize"
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
                                    required : false,
                                    attributes : ['quantity']
                                },
                                {
                                    model : ProductImage,
                                    as : 'images',
                                    required : false,
                                    attributes : ['imageUrl', 'altText', 'fileName'],
                                    where : {
                                        isPrimary : true
                                    }
                                },
                                {
                                    model : ProductDiscount,
                                    as : 'discounts',
                                    attributes : ['id', 'type', 'value'],
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

    async findCart (userId : number)
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

    async addItem (cartId : number, variantId : number, quantity : number)
    : Promise<CartItem> {
        return await CartItem.create({
            cartId,
            variantId,
            quantity
        })
    }

    async setItemQuantity (itemId : number, quantity : number)
    : Promise<number> {
        const [rows] = await CartItem.update({
            quantity
        },
        {
            where :{
                id : itemId
            }
        })
        return rows
    }

    async deleteItem (itemId : number)
    : Promise<number> {
        return await CartItem.destroy({
            where : {
                id : itemId,
            }
        })
    }

    async clearCart (cartId : number)
    : Promise<number> {
        return await CartItem.destroy({
            where : {
                cartId
            }
        })
    }
}

export default new CartRepository()