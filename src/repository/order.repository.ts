import { InferCreationAttributes, Op, Transaction } from "sequelize"
import { Order, OrderItem } from "../models/order.model.js"
import { OrderPaymentStatus, OrderStatus, ShippingMethod } from "../types/order.enum.js"
import { Product, ProductVariant } from "../models/product.model.js"
import Inventory from "../models/inventory.model.js"
import { PaymentStatus } from "../types/payment.enum.js"

class OrderRepository {
    async hasUserPurchasedVariant(userId: number, variantId: number)
    : Promise<boolean> {
        return (await OrderItem.findOne({
            where : {
                variantId
            },
            attributes : ['id'],
            include : [
                {
                    model : Order,
                    as : 'order',
                    required : true,
                    where : {
                        userId,
                        status : {
                            [Op.in] : [
                                OrderStatus.DELIVERED,
                                OrderStatus.COMPLETED
                            ]
                        }
                    },
                    attributes : []
                }
            ]
        })) ? true : false
    }

    async getOrderByOrderNumber (orderNumber : string, userId : number)
    : Promise<Order | null> {
        return await Order.findOne({
            where : {
                orderNumber,
                userId
            }
        })
    }

    async getOrderItems (orderId : number, transaction : Transaction | null)
    : Promise<OrderItem[]> {
        return await OrderItem.findAll({
            where : {
                orderId
            },
            transaction
        })
    }

    async createOrder (userId : number, ipAddress : string, orderNumber : string, addressId : number, subtotal : number, discountAmount : number,
        shippingMethod : ShippingMethod, shippingCost : number, finalPrice : number, transaction : Transaction
        ,couponId ?: number
        
    )
    : Promise<Order> {
        return await Order.create({
            orderNumber,
            userId,
            addressId,
            ipAddress ,
            subtotal,
            discountAmount,
            finalPrice,
            shippingMethod,
            shippingCost,
            couponId,
            status : OrderStatus.PENDING_PAYMENT,
            paymentStatus : OrderPaymentStatus.PENDING,
        },
        {
            transaction
        })
    }

    async createOrderItems (orderItems : any, transaction : Transaction)
    : Promise<OrderItem[]> {
        return await OrderItem.bulkCreate(orderItems, {transaction})
    }

    async cancelPendingOrder (orderNumber : string, userId : number, transaction : Transaction)
    : Promise<boolean> {
        const [rows] = await Order.update({
            status : OrderStatus.CANCELED,
        },
        {
            where : {
                orderNumber,
                userId,
                status : OrderStatus.PENDING_PAYMENT,
                paymentStatus : OrderPaymentStatus.PENDING
            },
            transaction
        }
        )
        return rows === 1
    }

    async completeOrderPayment (orderNumber : string, userId : number, transaction : Transaction)
    : Promise<boolean> {
        const [rows] = await Order.update({
            status : OrderStatus.PAID,
            paymentStatus : OrderPaymentStatus.PAID
        },
        {
            where : {
                orderNumber,
                userId,
                status : OrderStatus.PENDING_PAYMENT,
                paymentStatus : OrderPaymentStatus.PENDING
            },
            transaction
        }
        )
        return rows === 1
    }
}

export default new OrderRepository()