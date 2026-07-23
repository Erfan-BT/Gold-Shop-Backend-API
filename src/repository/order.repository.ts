import { InferCreationAttributes, Op, Transaction } from "sequelize"
import { Order, OrderItem } from "../models/order.model.js"
import { OrderPaymentStatus, OrderStatus, ShippingMethod } from "../types/order.enum.js"

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
}

export default new OrderRepository()