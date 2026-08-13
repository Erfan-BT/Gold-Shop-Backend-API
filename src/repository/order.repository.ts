import { FindAndCountOptions, InferCreationAttributes, Op, Transaction } from "sequelize"
import { Order, OrderItem } from "../models/order.model.js"
import { OrderPaymentStatus, OrderStatus, ShippingMethod } from "../types/order.enum.js"
import { Product, ProductVariant } from "../models/product.model.js"
import Inventory from "../models/inventory.model.js"
import { PaymentStatus } from "../types/payment.enum.js"
import Address from "../models/address.model.js"
import Coupon from "../models/coupon.model.js"
import Payment from "../models/payment.model.js"
import { ReturnItem, ReturnRequest } from "../models/return.model.js"
import User from "../models/user.model.js"
import sequelize from "../configs/sequelize.config.js"

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

    async getOrderByOrderNumber (orderNumber : string, userId ?: number)
    : Promise<Order | null> {
        return await Order.findOne({
            where : {
                orderNumber,
                ...(userId ? {userId : userId} : {})
            },
            include : [
                {
                    model : OrderItem,
                    as : 'items',
                    attributes : ['id']
                }
            ]
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

    async getExpiredPendingOrders ()
    : Promise<Order[]> {
        return await Order.findAll({
            where : {
                status : OrderStatus.PENDING_PAYMENT,
                paymentStatus : OrderPaymentStatus.PENDING,
                createdAt: {
                    [Op.lt] : new Date(Date.now() - 20 * 60 * 1000)
                }
            },
            attributes : ['id', 'userId', 'orderNumber']
        })
    }

    async getUserOrders(userId : number, page : number, limit : number)
    : Promise<{
        rows : Order[]
        count : number
    }> {
        const offset = (page - 1) * limit

        return Order.findAndCountAll({
            where: {
                userId,
            },
            attributes: [
                "orderNumber",
                "status",
                "paymentStatus",
                "finalPrice",
                "createdAt",
            ],
            order: [["createdAt", "DESC"]],
            limit,
            offset,
        })
    }

    async getOrder (userId : number, orderNumber : string)
    : Promise<Order | null> {
        return await Order.findOne({
            where : {
                userId,
                orderNumber
            },
            attributes : ['orderNumber', 'subtotal', 'discountAmount', 'shippingMethod',
                'shippingCost', 'finalPrice', 'status', 'paymentStatus', 'shippedAt', 'trackingCode', 'deliveredAt', 'createdAt'],
            include : [
                {
                    model : OrderItem,
                    as : 'items',
                    attributes: ["productTitle", "sku", "weight", "karat", "stoneType", "color", "quantity",
                        "unitPrice", "discountAmount", "finalPrice", "goldPrice18kAtTime"
                    ]
                },
                {
                    model : Address,
                    as : 'address',
                    attributes : ['addressLine', 'city', 'postalCode']
                },
                {
                    model : Coupon,
                    as : 'coupon',
                    attributes : ['code', 'type', 'value'],
                    required : false
                },
                {
                    model : Payment,
                    as : 'payment',
                    attributes : ['amount', 'cardPan', 'status', 'referenceCode'],
                    required : false
                }
            ]
        })
    }

    // --------------- ADMIN ---------------
    async getOrders (options: FindAndCountOptions<Order>)
    {
        return await Order.findAndCountAll(options)
    }

    async getOrderAdmin (orderNumber : string)
    {
        return await Order.findOne({
            where : {
                orderNumber
            },
            attributes : [
                'uuid',
                'orderNumber',
                'ipAddress',
                'subtotal',
                'discountAmount',
                'shippingMethod',
                'shippingCost',
                'finalPrice',
                'status',
                'paymentStatus',
                'shippedAt',
                'trackingCode',
                'deliveredAt',
                'createdAt',
            ],
            include : [
                {
                    model : OrderItem,
                    as : 'items',
                    attributes : [
                        'id',
                        'variantId',
                        'productTitle',
                        'sku',
                        'weight',
                        'karat',
                        'stoneType',
                        'color',
                        'quantity',
                        'unitPrice',
                        'discountAmount',
                        'finalPrice',
                        'goldPrice18kAtTime'
                    ],
                    required : true
                },
                {
                    model : User,
                    as : 'user',
                    attributes : ['id' ,'name', 'email', 'phone', 'isEmailVerified'],
                    required : true
                },
                {
                    model : Address,
                    as : 'address',
                    attributes : ['id' ,'addressLine', 'city', 'postalCode'],
                    required : true
                },
                {
                    model : Payment,
                    as : 'payment',
                    attributes : ['id', 'amount', 'status', 'cardPan', 'referenceCode', 'authorityCode', 'paidAt',
                        'refundAmount',
                        'refundReason',
                        'terminal_id',
                        'refundId',
                        'refundedAt',
                        'bankResponse'
                    ],
                    required : false
                },
                {
                    model : Coupon,
                    as : 'coupon',
                    attributes : ['code', 'type', 'value'],
                    required : false
                },
                {
                    model : ReturnRequest,
                    as : 'returnRequest',
                    attributes : ['id', 'status', 'refundStatus', 'reviewedAt'],
                    required : false
                }
            ]
        })
    }

    async changeOrderStatus (orderNumber : string, currentStatus : OrderStatus,status : OrderStatus, transaction : Transaction | null, extra?: Partial<Pick<
        Order,
        "trackingCode" |
        "shippedAt" |
        "deliveredAt" |
        "paymentStatus"
    >>)
    {
        const [rows] = await Order.update({
            status,
            ...(extra ?? {})
        },
        {  
            where : {
                orderNumber,
                status : currentStatus
            },
            transaction
        })
        return rows === 1
    }

    async changeTrackingCode (orderNumber : string, trackingCode : string)
    : Promise<boolean> {
        const [rows] = await Order.update({
            trackingCode
        },{
            where : {
                orderNumber,
                status : OrderStatus.SHIPPED
            }
        })
        return rows === 1
    }

    async statsMain() {
        const startOfToday = new Date()
        startOfToday.setHours(0, 0, 0, 0)

        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const [
            pendingOrderCount,
            processingOrderCount,
            shippingOrderCount,
            deliveredOrderCount,
            refundPendingOrderCount,
            refundedOrderCount,
            completedOrderCount,
            canceledOrderCount,
            todaySales,
            monthlySales
        ] = await Promise.all([
            Order.count({
                where: {
                    status: OrderStatus.PENDING_PAYMENT
                }
            }),

            Order.count({
                where: {
                    status: OrderStatus.PROCESSING
                }
            }),

            Order.count({
                where: {
                    status: OrderStatus.SHIPPED
                }
            }),

            Order.count({
                where: {
                    status: OrderStatus.DELIVERED
                }
            }),

            Order.count({
                where: {
                    status: OrderStatus.REFUND_PENDING
                }
            }),

            Order.count({
                where: {
                    status: OrderStatus.REFUNDED
                }
            }),

            Order.count({
                where: {
                    status: OrderStatus.COMPLETED
                }
            }),

            Order.count({
                where: {
                    status: OrderStatus.CANCELED
                }
            }),

            Order.sum('finalPrice', {
                where: {
                    paymentStatus: OrderPaymentStatus.PAID,
                    createdAt: {
                        [Op.gte]: startOfToday
                    }
                }
            }),

            Order.sum('finalPrice', {
                where: {
                    paymentStatus: OrderPaymentStatus.PAID,
                    createdAt: {
                        [Op.gte]: startOfMonth
                    }
                }
            })
        ])

        return {
            pendingOrderCount,
            processingOrderCount,
            shippingOrderCount,
            deliveredOrderCount,
            refundPendingOrderCount,
            refundedOrderCount,
            completedOrderCount,
            canceledOrderCount,
            todaySales: todaySales ?? 0,
            monthlySales: monthlySales ?? 0
        }
    }
}

export default new OrderRepository()