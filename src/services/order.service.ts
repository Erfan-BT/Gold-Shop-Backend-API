import sequelize from "../configs/sequelize.config.js"
import { Order } from "../models/order.model.js"
import addressRepository from "../repository/address.repository.js"
import cartRepository from "../repository/cart.repository.js"
import couponRepository from "../repository/coupon.repository.js"
import goldPriceRepository from "../repository/goldPrice.repository.js"
import inventoryRepository from "../repository/inventory.repository.js"
import orderRepository from "../repository/order.repository.js"
import { OrderStatus, ShippingMethod } from "../types/order.enum.js"
import { CheckoutItem, CheckoutSession, CouponData, Pricing } from "../types/order.type.js"
import { BadRequestError, ConflictError, InternalServerError, NotFoundError } from "../utils/appError.js"
import { RedisCache } from "../utils/cache.redis.js"
import cartHelper from "../utils/cart.helper.js"
import couponHelper from "../utils/coupon.helper.js"
import shippingHelper from "../utils/shipping.helper.js"
import tokenService from "./token.service.js"

class OrderService {
    async checkout (userId : number, addressId : number, shippingMethod : ShippingMethod, couponCode ?: string)
    : Promise<{
        checkoutToken: string;
        checkoutItems: CheckoutItem[];
        subtotal: number;
        productDiscount: number;
        couponData: CouponData;
        shippingCost: number;
        total: number;
    }> {
        const now = new Date()
        // Get Cart
        const cart = await cartRepository.getCart(userId)
        const cartItems = cart?.items
        if (!cart || !cartItems || cartItems?.length === 0)
            throw new BadRequestError('Cart Is Empty')
        // Validate Items & Calculate Prices
        let subtotal = 0
        let discountAmount = 0
        let lineTotal = 0
        let checkoutItems : CheckoutItem[] = []
        for (let item of cartItems) {
            // Get Variant
            const variant = item.variant
            const product = variant?.product

            if (!variant)
                throw new NotFoundError(`Product Variant Not Found { ID : ${item.variantId} }`)

            if (!product)
                throw new NotFoundError(`Product Not Found { ID : ${variant.productId} }`)

            if (!product.isActive || !variant.isActive)
                throw new ConflictError('Product Is InActive')

            if ((variant.inventory?.quantity ?? 0) < item.quantity)
                throw new ConflictError('Not Enough Stock')

            // Pricing
            const pricing = cartHelper.calculatePricing(item)
            if (!pricing)
                throw new InternalServerError("Pricing Calculation Failed")

            subtotal += pricing.subtotal
            discountAmount += pricing.discountAmount
            lineTotal += pricing.lineTotal

            checkoutItems.push({
                item,
                pricing
            })
        }
        // Validate Address
        const address = await addressRepository.getUserAddress(userId, addressId)
        if (!address)
            throw new NotFoundError(`Address Not Found { ID : ${addressId} }`)

        // Calculate Shipping Cost
        let shippingCost = shippingHelper.calculateShippingCost(shippingMethod)
        
        // Validate Coupon
        let couponData : CouponData = null
        if (couponCode)
            couponData = await couponHelper.validateAndCalculate(couponCode, lineTotal)
        
        // Checkout Session Items
        const checkoutSessionItems = checkoutItems.map(item => ({
            variantId: item.item.variantId,
            quantity: item.item.quantity,
            pricing: item.pricing
        }))
        // Create Checkout Token
        const token = await tokenService.generateOTP(userId, 'checkout')
        const total =
            Math.max(lineTotal - (couponData?.couponDiscount ?? 0), 0)
            + shippingCost
        const goldPriceAtTime = await goldPriceRepository.getPrice()
        if (!goldPriceAtTime)
            throw new InternalServerError('GOLD PRICE ERROR')
        
        const checkoutSession : CheckoutSession = {
            userId,
            cartId : cart.id,
            items : checkoutSessionItems,
            subtotal,
            productDiscount : discountAmount,
            couponData,
            addressId,
            shippingMethod,
            shippingCost,
            total,

            createdAt : now,
            goldPrice18kAtTime : goldPriceAtTime.pricePerGram18k,
            expiresAt : new Date(now.getTime() + 10 * 60 * 1000)
        }
        // Set On Redis
        await RedisCache.set(token, checkoutSession, 10 * 60)

        return {
            checkoutToken : token,
            checkoutItems,
            subtotal,
            productDiscount : discountAmount,
            couponData,
            shippingCost,
            total,
        }
    }

    async cancelPendingOrder (orderNumber : string, userId : number, authority : string | null)
    : Promise<void> {
        // Order
        const order = await orderRepository.getOrderByOrderNumber(orderNumber, userId)
        if (!order)
            throw new NotFoundError(`Order Not Found { Order-Number : ${orderNumber} }`)

        // Check Order Current Status
        if (order.status !== OrderStatus.PENDING_PAYMENT)
            throw new BadRequestError(`Invalid Order Status { Status : ${order.status} }`)

        // Change Status And Return Inventory & Coupon
        await sequelize.transaction(async t => {
            // Status
            if (!(await orderRepository.cancelPendingOrder(orderNumber, userId, t)))
                throw new ConflictError('Order Not Canceled')

            // Inventory
            const orderItems = await orderRepository.getOrderItems(order.id, t)
            for (let item of orderItems) {
                if(!(await inventoryRepository.increaseStock(item.variantId, item.quantity, t)))
                    throw new ConflictError('Inventory Not Changed')
            }

            // Coupon
            if (order.couponId !== null)
                if (!(await couponRepository.returnCoupon(order.couponId, t)))
                    throw new ConflictError('Coupon Not Return')
            
        })

        // Remove Redis
        if (authority !== null)
            await RedisCache.delete(`payment:authority:${authority}`)
    }

    async cancelExpiredOrders()
    {
        const orders = await orderRepository.getExpiredPendingOrders();

        for (let order of orders) {
            await this.cancelPendingOrder(order.orderNumber, order.userId, null)
        }
    }

    async getUserOrders (userId : number, page : number, limit : number)
    : Promise<{
        rows: Order[];
        count: number;
    }> {
        return await orderRepository.getUserOrders(userId, page, limit)
    }

    async getUserOrder (userId : number, orderNumber : string)
    : Promise<Order> {
        // Get Order
        const order = await orderRepository.getUserOrder(userId, orderNumber)
        if (!order)
            throw new NotFoundError(`Order Not Found { Order-Number : ${orderNumber} }`)
        return order
    }
}

export default new OrderService()