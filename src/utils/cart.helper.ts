import { CartItem } from "../models/cart.model.js";
import { CartItemDTO } from "../types/cart.type.js";

class CartHelper {
    toCartItemDTO (cartItem : CartItem) 
    : {
        cartItemDto : CartItemDTO,
        pricing : {
            subtotal : number;
            discount : number
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
        const discount = discountPerItem * cartItem.quantity
        const finalPrice = unitPrice - discountPerItem;

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
            unitPrice,
            discount : cartDiscount,
            finalPrice,
            lineTotal : finalPrice * cartItem.quantity,
        }
        const pricing = {
            subtotal,
            discount
        }
        return {
            cartItemDto,
            pricing
        }        
    }
}

export default new CartHelper()