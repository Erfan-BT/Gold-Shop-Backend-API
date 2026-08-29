import { v4 } from "uuid";
import sequelize from "../configs/sequelize.config.js";
import orderRepository from "../repository/order.repository.js";
import productRepository from "../repository/product.repository.js";
import { CheckoutSession } from "../types/order.type.js";
import { BadRequestError, ConflictError, ForbiddenError, InternalServerError, NotFoundError } from "../utils/appError.js";
import { RedisCache } from "../utils/cache.redis.js";
import { ProductVariant } from "../models/product.model.js";
import inventoryRepository from "../repository/inventory.repository.js";
import couponRepository from "../repository/coupon.repository.js";
import cartRepository from "../repository/cart.repository.js";
import zarinpalService from "./getaway/zarinpal.service.js";
import { OrderPaymentStatus, OrderStatus } from "../types/order.enum.js";
import orderService from "./order.service.js";
import paymentRepository from "../repository/payment.repository.js";
import { CreatePaymentResponseAPI } from "../types/payment.type.js";
import { PaymentDto } from "../validation/payment.validation.js";

class PaymentService {
    async beforePayment (paymentData : PaymentDto, userId : number, ipAddress : string)
    : Promise<{
        orderNumber : string,
        bankResponse : CreatePaymentResponseAPI
    }> {
        const variants = new Map<number, ProductVariant>();
        // Validate Token
        const checkoutSession = await RedisCache.get<CheckoutSession>(paymentData.checkoutToken)
        if (!checkoutSession)
            throw new BadRequestError('Invalid Token')
        if (checkoutSession.userId !== userId)
            throw new ForbiddenError('Not Access')
        const now = new Date()
        if (now.getTime() > checkoutSession.expiresAt.getTime())
            throw new ForbiddenError('Token Expires')
        // Check Variant And Inventory For Items
        for (let item of checkoutSession.items) {
            const variant = await productRepository.getVariant(item.variantId)
            if (!variant)
                throw new NotFoundError(`Product Variant Not Found { ID : ${item.variantId} }`)
            const inventory = variant.inventory
            if (!inventory)
                throw new NotFoundError(`Inventory For Variant Not Found { Variant-ID : ${item.variantId} }`)
            variants.set(item.variantId, variant)
        }
        // Create OrderNumber
        const timestamp = Date.now().toString(36).toUpperCase();
        const randomUuid = v4().replace(/-/g, '').slice(0, 12).toUpperCase()
        const orderNumber = `ORD-${(timestamp + randomUuid).slice(0, 20)}`
        // Create Order & Items    
        await sequelize.transaction(async (t) => {
            // Create Order
            const order = await orderRepository.createOrder(userId, ipAddress, orderNumber,
                checkoutSession.addressId, checkoutSession.subtotal, checkoutSession.productDiscount, checkoutSession.shippingMethod,
                checkoutSession.shippingCost, checkoutSession.total, t, checkoutSession.couponData?.couponId
            )

            // Change Stock
            for (let item of checkoutSession.items) {
                const variant = variants.get(item.variantId)
                const inventory = variant?.inventory
                if (!variant || !inventory)
                    throw new InternalServerError("Variant Missing");
                if (!(await inventoryRepository.decreaseStock(variant.id, item.quantity, t)))
                    throw new ConflictError(`Not Enough Stock For Product Variant { ID : ${variant.id} }`)
            }

            // Change Coupon Usage
            if (checkoutSession.couponData !== undefined && checkoutSession.couponData !== null)
                if (!(await couponRepository.useCoupon(checkoutSession.couponData.couponId, t)))
                    throw new ConflictError('Invalid Coupon Code')

            // Create Order Items
            const orderItems = checkoutSession.items.map(item => {
                const variant = variants.get(item.variantId);
                if (!variant)
                    throw new InternalServerError("Variant Missing");

                return {
                    orderId: order.id,
                    variantId: variant.id,

                    productTitle: variant.product!.title,
                    sku: variant.sku,

                    weight: variant.weight,
                    karat: variant.karat,
                    stoneType: variant.stoneType,
                    color: variant.color,

                    quantity: item.quantity,

                    unitPrice: item.pricing.unitPrice,
                    discountAmount: item.pricing.discountAmount,
                    finalPrice: item.pricing.finalPrice,

                    goldPrice18kAtTime: checkoutSession.goldPrice18kAtTime
                }
            })
            await orderRepository.createOrderItems(orderItems, t)

            // Clear Cart
            await cartRepository.clearCart(checkoutSession.cartId, t)
            
        })
        // Create ZarinPal Authority
        const response = await zarinpalService.createPayment(checkoutSession.total, orderNumber)
        if (response.data.code < 100)
            throw new InternalServerError('Zarinpal Error')
        await RedisCache.set(`payment:authority:${response.data.authority}`, {
            orderNumber,
            userId
        }, 20 * 60)

        // Delete Checkout Token
        await RedisCache.delete(paymentData.checkoutToken)
        return {
            orderNumber,
            bankResponse : response
        }
    }

    async callback (authority : string, status : string, ipAddress : string)
    : Promise<{
        success : boolean,
        msg : string
    }> {
        // Get Order Number & User Id
        const data = await RedisCache.get<{
            orderNumber : string;
            userId : number;
        }>(`payment:authority:${authority}`)
        if (!data)
            throw new BadRequestError('Invalid Authority')

        // ----- NOK -----
        if (status === 'NOK') {
            await orderService.cancelPendingOrder(data.orderNumber, data.userId, authority)
            return {
                success : false,
                msg : 'Payment Failed, Order Canceled'
            }
        }
            
        // ----- OK -----
        // Order
        const order = await orderRepository.getOrderByOrderNumber(data.orderNumber, data.userId)
        if (!order)
            throw new NotFoundError(`Order Not Found { Order-Number : ${data.orderNumber} }`)

        if (order.status === OrderStatus.PAID || order.paymentStatus === OrderPaymentStatus.PAID) {
            await RedisCache.delete(`payment:authority:${authority}`);
            return {
                success : true,
                msg : 'Payment Successful, Order Successfully Placed'
            }
        }

        if (order.status !== OrderStatus.PENDING_PAYMENT)
            throw new BadRequestError(`Invalid Order Status { Status : ${order.status} }`)

        // Verify Payment
        const verifyResult = await zarinpalService.verifyPayment(authority, order.finalPrice)
        if (!verifyResult || !verifyResult.success) {
            await orderService.cancelPendingOrder(data.orderNumber, data.userId, authority)
            return {
                success : false,
                msg : 'Payment Failed, Order Canceled'
            }
        }

        // Change Order Statuses To PAID & Create Payment
        await sequelize.transaction(async t => {
            // Change Statuses
            if (!(await orderRepository.completeOrderPayment(data.orderNumber, data.userId, t)))
                throw new ConflictError("Order Is Already Processed")

            // Create Payment
            await paymentRepository.createPayment({
                orderId : order.id,
                amount : order.finalPrice,
                transactionId : String(verifyResult.data!.ref_id),
                authorityCode : authority,
                referenceCode : String(verifyResult.data!.ref_id),
                cardPan : verifyResult.data!.card_pan ?? 'null',
                ipAddress,
                bankResponse : JSON.stringify(verifyResult.data)
            }, t)
        })
        // Remove Redis
        await RedisCache.delete(`payment:authority:${authority}`);

        return {
            success : true,
            msg : 'Payment Successful, Order Successfully Placed'
        }
    }
}

export default new PaymentService()