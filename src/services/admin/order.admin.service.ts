import { OrderQueryBuilder } from "../../builders/orderQuary.builder.js";
import { logger } from "../../configs/pino.config.js";
import sequelize from "../../configs/sequelize.config.js";
import { Order } from "../../models/order.model.js";
import { refundQueue } from "../../queue/refund.queue.js";
import adminAuditLogRepository from "../../repository/adminAuditLog.repository.js";
import inventoryRepository from "../../repository/inventory.repository.js";
import orderRepository from "../../repository/order.repository.js";
import paymentRepository from "../../repository/payment.repository.js";
import { AdminAuditAction, AdminAuditEntity } from "../../types/adminAuditLog.enum.js";
import { OrderPaymentStatus, OrderStatus } from "../../types/order.enum.js";
import { PaymentStatus } from "../../types/payment.enum.js";
import { BadRequestError, ConflictError, InternalServerError, NotFoundError } from "../../utils/appError.js";
import { OrdersAdminDto } from "../../validation/order.validation.js";
import orderService from "../order.service.js";

class AdminOrderService {
    async getOrders(qs : OrdersAdminDto)
    : Promise<{
        rows: Order[];
        count: number;
    }> {
        // Create Options
        const options = OrderQueryBuilder.build(qs);
        // get Orders
        return await orderRepository.getOrders(options)
    }

    async getOrder(orderNumber : string)
    : Promise<Order> {
        // Get Order
        const order = await orderRepository.getOrderAdmin(orderNumber)
        if (!order)
            throw new NotFoundError(`Order Not Found { ID : ${orderNumber} }`)
        return order
    }

    async setOrderStatusProcess (orderNumber : string, adminId : number)
    : Promise<void> {
        // Get Order
        const order = await orderRepository.getOrderByOrderNumber(orderNumber)
        if (!order)
            throw new NotFoundError(`Order Not Found { Order-Number : ${orderNumber} }`)

        if (order.status !== OrderStatus.PAID || order.paymentStatus !== OrderPaymentStatus.PAID)
            throw new BadRequestError('Order Can Not Be Processed')

        await sequelize.transaction(async t => {
            // Change Status
            if (!(await orderRepository.changeOrderStatus(orderNumber, OrderStatus.PAID, OrderStatus.PROCESSING, t)))
                throw new ConflictError('Order Status Not Changed To Processing')

            // Add AdminAudit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.PROCESS,
                entityType : AdminAuditEntity.ORDER,
                entityId : order.id,
                reason : null,
                ipAddress : null,
                oldValues : {
                    status : OrderStatus.PAID
                },
                newValues : {
                    status : OrderStatus.PROCESSING
                },
            }, t)
        })
        
        return
    }

    async setOrderStatusShipped (orderNumber : string, trackingCode : string, adminId : number)
    : Promise<void> {
        // Get Order
        const order = await orderRepository.getOrderByOrderNumber(orderNumber)
        if (!order)
            throw new NotFoundError(`Order Not Found { Order-Number : ${orderNumber} }`)

        if (order.status !== OrderStatus.PROCESSING || order.paymentStatus !== OrderPaymentStatus.PAID)
            throw new BadRequestError('Order Can Not Be Shpped')

        const now = new Date()
        await sequelize.transaction(async t => {
            // Change Status
            if (!(await orderRepository.changeOrderStatus(orderNumber, OrderStatus.PROCESSING, OrderStatus.SHIPPED, t, {
                shippedAt : now,
                trackingCode
            })))
                throw new ConflictError('Order Status Not Changed To Shipped')

            // Add AdminAudit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.SHIP,
                entityType : AdminAuditEntity.ORDER,
                entityId : order.id,
                reason : null,
                ipAddress : null,
                oldValues : {
                    status : OrderStatus.PROCESSING,
                    shippedAt : null,
                    trackingCode : null
                },
                newValues : {
                    status : OrderStatus.SHIPPED,
                    shippedAt : now,
                    trackingCode
                },
            }, t)
        })

        return
    }

    async setOrderStatusDelivered (orderNumber : string, adminId : number)
    : Promise<void> {
        // Get Order
        const order = await orderRepository.getOrderByOrderNumber(orderNumber)
        if (!order)
            throw new NotFoundError(`Order Not Found { Order-Number : ${orderNumber} }`)

        if (order.status !== OrderStatus.SHIPPED || order.paymentStatus !== OrderPaymentStatus.PAID)
            throw new BadRequestError('Order Can Not Be Delivered')

        const now = new Date()
        await sequelize.transaction(async t => {
            // Change Status
            if (!(await orderRepository.changeOrderStatus(orderNumber, OrderStatus.SHIPPED, OrderStatus.DELIVERED, t, {
                deliveredAt : now,
            })))
                throw new ConflictError('Order Status Not Changed To Delivered')

            // Add AdminAudit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.DELIVER,
                entityType : AdminAuditEntity.ORDER,
                entityId : order.id,
                reason : null,
                ipAddress : null,
                oldValues : {
                    status : OrderStatus.SHIPPED,
                    deliveredAt : null,
                },
                newValues : {
                    status : OrderStatus.DELIVERED,
                    deliveredAt : now,
                },
            }, t)
        })

        return   
    }

    async cancelOrder (orderNumber : string, reason : string, adminId : number)
    {
        // Get Order
        const order = await orderRepository.getOrderAdmin(orderNumber)
        if (!order)
            throw new NotFoundError(`Order Not Found { Order-Number : ${orderNumber} }`)

        // Check Order Status
        if (order.status === OrderStatus.PENDING_PAYMENT) {
            await orderService.cancelPendingOrder(order.orderNumber, order.userId, null)
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.CANCEL,
                entityType : AdminAuditEntity.ORDER,
                entityId : order.id,
                ipAddress : null,
                oldValues : {
                    orderStatus : order.status,
                    paymentStatus : order.paymentStatus
                },
                newValues : {
                    status : OrderStatus.CANCELED,
                    paymentStatus : OrderPaymentStatus.CANCELED
                },
                reason
            }, null)
            return
        }

        if (order.status !== OrderStatus.PAID && order.status !== OrderStatus.PROCESSING)
            throw new BadRequestError('Can Not Refund This Order')

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

            for (const item of order.items) {
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
        
        await adminAuditLogRepository.createAdminAuditLog({
            adminId,
            action : AdminAuditAction.CANCEL,
            entityType : AdminAuditEntity.ORDER,
            entityId : order.id,
            ipAddress : null,
            oldValues : {
                orderStatus : order.status,
                paymentStatus : order.paymentStatus
            },
            newValues : {
                orderStatus : OrderStatus.REFUND_PENDING,
                paymnetStatus : OrderPaymentStatus.REFUND_PENDING
            },
            reason
        }, null)
        
        return
    }

    async changeTrackingCode (orderNumber : string, trackingCode : string, adminId : number)
    : Promise<{
        trackingCode : string
    }> {
        // Get Order
        const order = await orderRepository.getOrderByOrderNumber(orderNumber)
        if (!order)
            throw new NotFoundError(`Order Not Found { Order-Number : ${orderNumber} }`)

        if (order.status !== OrderStatus.SHIPPED)
            throw new BadRequestError('Can Not Change TrackingCode For This Order')

        // Check Current Tracking Code
        if (order.trackingCode === trackingCode)
            return {
                trackingCode
            }

        await sequelize.transaction(async t => {
            // Change Tracking Code
            if (!(await orderRepository.changeTrackingCode(orderNumber, trackingCode, t)))
                throw new ConflictError('Tracking Code Not Changed')

            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.UPDATE,
                entityType : AdminAuditEntity.ORDER,
                entityId : order.id,
                oldValues : {
                    trackingCode : order.trackingCode
                },
                newValues : {
                    trackingCode
                },
                ipAddress : null,
                reason : null
            }, t)
        })
        return {
            trackingCode
        }
    }
}

export default new AdminOrderService()