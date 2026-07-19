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
            const cartItem = cartHelper.toCartItemDTO(item)
            // Add Item
            if (cartItem) {
                items.push(cartItem.cartItemDto)
                subtotal += cartItem.pricing.subtotal
                discount += cartItem.pricing.discount
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

    async addItem (userId : number, variantId : number, quantity : number)
    : Promise<void> {
        // Check Variant
        const variant = await productRepository.getVariant(variantId)
        if (!variant)
            throw new NotFoundError('Product Not Found')

        // Stock
        const stock = variant.inventory?.quantity
        if ((stock === undefined || stock === null))
            throw new InternalServerError('Error On Get Product Stock')
        
        // Check Exists Item
        const item = await cartRepository.findUserCartItem(userId, variantId)
        let oldQuantity = item?.quantity ?? 0

        // Check New Quantity & Stock
        const newQuantity = oldQuantity + quantity
        if (newQuantity > stock)
            throw new ConflictError('Insufficient stock')

        // Change Quantity
        if (item) {
            await cartRepository.setItemQuantity(item.id, newQuantity)
            return
        }

        // Get Cart
        const [cart] = await cartRepository.findOrCreateCart(userId)

        // Add Item
        await cartRepository.addItem(cart.id, variantId, quantity)
        return
    }

    async changeQuantity (userId : number, variantId : number, quantity : number)
    {
        // Check Exists Item
        const item = await cartRepository.findUserCartItem(userId, variantId)
        if (!item)
            throw new NotFoundError('Item Not Found')

        // No Change
        if (item.quantity === quantity)
            return

        // Check Variant
        const variant = await productRepository.getVariant(variantId)
        if (!variant)
            throw new NotFoundError('Product Not Found')

        // Stock
        const stock = variant.inventory?.quantity
        if ((stock === undefined || stock === null))
            throw new InternalServerError('Error On Get Product Stock')

        // Check New Quantity & Stock
        if (quantity > stock)
            throw new ConflictError('Insufficient stock')

        // Change Quantity
        await cartRepository.setItemQuantity(item.id, quantity)
        return
    }
}

export default new CartService()