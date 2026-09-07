import cartRepository from "../repository/cart.repository.js"
import productRepository from "../repository/product.repository.js"
import { CartDTO, CartItemDTO } from "../types/cart.type.js"
import { ConflictError, InternalServerError, NotFoundError } from "../utils/appError.js"
import cartHelper from "../utils/cart.helper.js"

class CartService {
    async getCart (userId : number)                             
    : Promise<CartDTO>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            {
        // Get Cart               
        const cart = await cartRepository.getCart(userId)
        // If Cart Dont Exists
        if (!cart) {
            return {
                totalItems : 0,
                subtotal : 0,
                discount : 0,
                total : 0,
                items : []
            }
        }
        // If Cart Exists
        let subtotal : number = 0
        let discount : number = 0
        let items : CartItemDTO[] = []
        const cartItems = cart.items ?? []
        // Create Items & Calculate subtotal,discount
        for (const item of cartItems) {
            const cartItem = await cartHelper.toCartItemDTO(item)
            // Add Item
            if (cartItem) {
                items.push(cartItem.cartItemDto)
                subtotal += cartItem.pricing.subtotal
                discount += cartItem.pricing.discountAmount
            }
        }
        // Total Item
        const totalItems = items.reduce(
            (sum, item) => sum + item.quantity, 
            0
        )                                            

        return {
            totalItems,
            subtotal,
            discount,
            total : subtotal - discount,
            items
        }
    }

    async addItemToCart (userId : number, variantId : number, quantity : number)
    : Promise<void> {
        // Check Variant
        const variant = await productRepository.getVariant(variantId)
        if (!variant)
            throw new NotFoundError(`Product Variant Not Found { ID : ${variantId} }`)

        // Stock
        const stock = variant.inventory?.quantity
        if (stock === undefined)
            throw new InternalServerError('Error On Get Product Variant Stock')
        
        // Check Exists Item
        const item = await cartRepository.findUserCartItem(userId, variantId)
        let oldQuantity = item?.quantity ?? 0

        // Check New Quantity & Stock
        const newQuantity = oldQuantity + quantity
        if (newQuantity > stock)
            throw new ConflictError('Insufficient Stock')

        // Change Quantity
        if (item !== null) {
            if (!(await cartRepository.setItemQuantity(item.id, oldQuantity, newQuantity)))
                throw new ConflictError('Item Quantity Not Changed')
            else
                return
        }

        // Get Cart
        const [cart] = await cartRepository.findOrCreateCart(userId)

        // Add Item To Cart
        await cartRepository.addItemToCart(cart.id, variantId, quantity)
        return
    }

    async changeQuantity (userId : number, variantId : number, quantity : number)
    : Promise<void> {
        // Check Exists Item
        const item = await cartRepository.findUserCartItem(userId, variantId)
        if (!item)
            throw new NotFoundError(`Item Not Found { Variant-ID : ${variantId} }`)

        // No Change
        if (item.quantity === quantity)
            return

        // Check Variant
        const variant = await productRepository.getVariant(variantId)
        if (!variant)
            throw new NotFoundError(`Product Variant Not Found { ID : ${variantId} }`)

        // Stock
        const stock = variant.inventory?.quantity
        if (stock === undefined)
            throw new InternalServerError('Error On Get Product  Variant Stock')

        // Check New Quantity & Stock
        if (quantity > stock)
            throw new ConflictError('Insufficient Stock')

        // Change Quantity
        if (!(await cartRepository.setItemQuantity(item.id, stock, quantity)))
            throw new ConflictError('Item Quantity Not Changed')
        return
    }

    async deleteItemFromCart (userId : number, variantId : number)
    : Promise<void> {
        // Check Exists Item
        const item = await cartRepository.findUserCartItem(userId, variantId)
        if (!item)
            throw new NotFoundError(`Item Not Found { Variant-ID : ${variantId} }`)

        // Delete Item From Cart
        if (!(await cartRepository.deleteItemFromCart(item.id)))
            throw new ConflictError('Item Not Deleted From Cart')
        return
    }

    async clearCart (userId : number)
    : Promise<void> {
        // Get Cart
        const cart = await cartRepository.findUserCart(userId)
        if (!cart)
            return
        // Clear Cart
        await cartRepository.clearCart(cart.id)
        return
    }
}

export default new CartService()