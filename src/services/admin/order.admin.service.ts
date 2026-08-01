import { OrderQueryBuilder } from "../../builders/orderQuary.builder.js";
import orderRepository from "../../repository/order.repository.js";
import { OrdersAdminDto } from "../../validation/order.validation.js";

class AdminOrderService {
    async getOrders(qs : OrdersAdminDto)
    {
        const options = OrderQueryBuilder.build(qs);
        return await orderRepository.getOrders(options)
    }
}

export default new AdminOrderService()