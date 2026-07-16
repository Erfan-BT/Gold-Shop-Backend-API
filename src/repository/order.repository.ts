import { Op } from "sequelize"
import { Order, OrderItem } from "../models/order.model.js"
import { OrderStatus } from "../types/order.enum.js"

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
}

export default new OrderRepository()