import { OrderQueryBuilder } from "../../builders/orderQuary.builder.js";
import { logger } from "../../configs/pino.config.js";
import sequelize from "../../configs/sequelize.config.js";
import { refundQueue } from "../../queue/refund.queue.js";
import inventoryRepository from "../../repository/inventory.repository.js";
import orderRepository from "../../repository/order.repository.js";
import paymentRepository from "../../repository/payment.repository.js";
import { OrderPaymentStatus, OrderStatus } from "../../types/order.enum.js";
import { PaymentStatus } from "../../types/payment.enum.js";
import { ConflictError, InternalServerError, NotFoundError } from "../../utils/appError.js";
import { OrdersAdminDto } from "../../validation/order.validation.js";
import zarinpalService from "../getaway/zarinpal.service.js";
import orderService from "../order.service.js";

class AdminOrderService {
    async getOrders(qs : OrdersAdminDto)
    {
        const options = OrderQueryBuilder.build(qs);
        return await orderRepository.getOrders(options)
    }

    async getOrder(orderNumber : string)
    {
        const order = await orderRepository.getOrderAdmin(orderNumber)
        if (!order)
            throw new NotFoundError(`Order ${orderNumber}`)
        return order
    }

    async setOrderStatusProcess (orderNumber : string)
    {
        if (!(await orderRepository.changeOrderStatus(orderNumber, OrderStatus.PAID, OrderStatus.PROCESSING, null)))
            throw new ConflictError('Order Status Not Changed To Processing')
    }

    async setOrderStatusShipped (orderNumber : string, trackingCode : string)
    {
        if (!(await orderRepository.changeOrderStatus(orderNumber, OrderStatus.PROCESSING, OrderStatus.SHIPPED, null, {
            shippedAt : new Date(),
            trackingCode
        })))
            throw new ConflictError('Order Status Not Changed To Shipped')
    }

    async setOrderStatusDelivered (orderNumber : string)
    {
        if (!(await orderRepository.changeOrderStatus(orderNumber, OrderStatus.SHIPPED, OrderStatus.DELIVERED, null, {
            deliveredAt : new Date(),
        })))
            throw new ConflictError('Order Status Not Changed To Delivered')
    }

    async cancelOrder (orderNumber : string, reason : string, adminId : number)
    {
        // Get Order
        const order = await orderRepository.getOrderAdmin(orderNumber)
        if (!order)
            throw new NotFoundError('Order Not Found')
        // Check Order Status
        if (order.status === OrderStatus.PENDING_PAYMENT)
            return await orderService.cancelPendingOrder(order.orderNumber, order.userId, null)
        if (order.status !== OrderStatus.PAID && order.status !== OrderStatus.PROCESSING)
            throw new ConflictError('Can Not Refund This Order')
        // ----- Paid Order -----
        const result = await sequelize.transaction(async t => {
        // Refund Payment
            // Get Payment
            const payment = await paymentRepository.getPayment(order.id, t)
            if (!payment || payment.status !== PaymentStatus.PAID)
                throw new ConflictError('Payment Is Not Refundable')
            // Change Order Statuses
            if (!(await orderRepository.changeOrderStatus(order.orderNumber, order.status, OrderStatus.REFUND_PENDING, t, {paymentStatus : OrderPaymentStatus.REFUND_PENDING})))
                throw new ConflictError("Order Status Not Changed")
            // Change Payment Status
            if (!(await paymentRepository.changePaymentStatus(payment.id, PaymentStatus.PAID, PaymentStatus.REFUND_PENDING, t)))
                throw new ConflictError("Payment Status Not Changed")
        // Return Items
            if (!order.items || order.items.length === 0)
                throw new NotFoundError('Order Items Not Found')
            for (const item of order.items!) {
                if (!(await inventoryRepository.increaseStock(item.variantId, item.quantity, t)))
                    throw new InternalServerError("Inventory Not Changed")
            }
        // Return
            return {
                paymentId : payment.id,
                orderId : order.id
            }
        })
        // Add Refund Payment To Queue
        try {
            await refundQueue.add('refund-payment', {
                adminId,
                reason,
                ...result
            })
        } catch (error) {
            logger.error({
                error,
                orderNumber,
                paymentId: result.paymentId,
                orderId: result.orderId,
            }, "Failed To Add Refund Job")
            throw new InternalServerError(`Refund For Order ${orderNumber} Not Add To Queue`)
        }
        // Log
        logger.info({
            adminId,
            reason,
            ...result
        }, "Admin Requested Order Refund")
        return
    }

    async changeTrackingCode (orderNumber : string, trackingCode : string)
    {
        // Get Order
        const order = await orderRepository.getOrderByOrderNumber(orderNumber)
        if (!order)
            throw new NotFoundError('Order Not Found')
        if (order.status !== OrderStatus.SHIPPED)
            throw new ConflictError('Can Not Change TrackingCode For This Order')
        // Check Current Tracking Code
        if (order.trackingCode === trackingCode)
            return
        // Change Tracking Code
        if (!(await orderRepository.changeTrackingCode(orderNumber, trackingCode)))
            throw new ConflictError('Tracking Code Not Changed')
        return
    }

    async statsMain ()
    {
        const statsResult = await orderRepository.statsMain()
        return statsResult
    }
}

export default new AdminOrderService()