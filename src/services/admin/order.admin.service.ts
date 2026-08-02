import { OrderQueryBuilder } from "../../builders/orderQuary.builder.js";
import orderRepository from "../../repository/order.repository.js";
import { OrderStatus } from "../../types/order.enum.js";
import { ConflictError, NotFoundError } from "../../utils/appError.js";
import { OrdersAdminDto } from "../../validation/order.validation.js";

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

}

export default new AdminOrderService()