import { CartItem } from "../models/cart.model.js";
import { CartItemDTO } from "../types/cart.type.js";
import { Pricing } from "../types/order.type.js";

class CartHelper {
    toCartItemDTO (cartItem : CartItem) 
    : {
        cartItemDto : CartItemDTO,
        pricing : {
            subtotal : number;
            discountAmount : number
        }
    } | null {
        const variant = cartItem.variant
        if (!variant
            || !variant.product
            || !variant.inventory
            || !variant.images?.[0]
            )
            return null
        const image = variant.images[0]
        const calculatePricing = this.calculatePricing(cartItem) 
        if (!calculatePricing)
            return null
        const cartItemDto = {
            variantId : variant.id,
            title : variant.product.title,
            slug : variant.product.slug,
            sku : variant.sku,
            quantity : cartItem.quantity,
            stock : variant.inventory.quantity,
            image : {
                imageUrl : image.imageUrl,
                altText : image.altText,
                fileName : image.fileName
            },
            unitPrice : calculatePricing.unitPrice,
            discount : calculatePricing.discount,
            finalPrice : calculatePricing.finalPrice,
            lineTotal : calculatePricing.lineTotal
        }
        const pricing = {
            subtotal : calculatePricing.subtotal,
            discountAmount : calculatePricing.discountAmount
        }
        return {
            cartItemDto,
            pricing
        }        
    }

    calculatePricing (cartItem : CartItem)
    : Pricing | null {
        const variant = cartItem.variant
        const inventory = variant?.inventory
        if (!variant || !inventory)
            return null

        const unitPrice = variant.currentPrice
        const activeDiscount = variant.discounts?.[0];
        const cartDiscount = activeDiscount
            ? {
                type: activeDiscount.type,
                value: activeDiscount.value
            }
            : null;               
        const discountPerItem = cartDiscount
            ? (
            (cartDiscount.type === 'percent') ? ((unitPrice * cartDiscount.value) /100)
            : Math.min(unitPrice, cartDiscount.value)
            ) : 0

        const subtotal = unitPrice * cartItem.quantity
        const finalPrice = Math.max(0, unitPrice - discountPerItem);

        const discountAmount = discountPerItem * cartItem.quantity;
        const lineTotal = finalPrice * cartItem.quantity;

        return {
            unitPrice,
            discount : cartDiscount,
            discountPerItem,
            finalPrice,
            subtotal,
            discountAmount,
            lineTotal
        }
    }
}

export default new CartHelper()