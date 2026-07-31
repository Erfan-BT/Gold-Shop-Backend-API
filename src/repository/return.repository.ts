import { Transaction } from "sequelize"
import { ReturnItem, ReturnRequest } from "../models/return.model.js"
import { CreateReturnItemType, RefundStatus, ReturnStatus } from "../types/return.enum.js"
import { Order } from "../models/order.model.js"

class ReturnRepository {
    async getUserReturnRequests (userId : number)
    : Promise<ReturnRequest[]> {
        return await ReturnRequest.findAll({
            include : [
                {
                    model : Order,
                    as : 'order',
                    attributes : [],
                    required : true,
                    where : {
                        userId
                    }
                }
            ],
            attributes : ['id', 'orderNumber', 'status', 'refundStatus'],
            order : ['createdAt', 'DESC']
        })
    }
    
    async getOrderReturnRequest (orderId : number)
    : Promise<ReturnRequest | null> {
        return await ReturnRequest.findOne({
            where : {
                orderId
            }
        })
    }

    async createReturnRequest (orderId : number, transaction : Transaction)
    : Promise<ReturnRequest> {
        return await ReturnRequest.create({
            orderId,
            status : ReturnStatus.PENDING,
            refundStatus : RefundStatus.PENDING
        },{
            transaction
        })
    }

    async createReturnItems (items : CreateReturnItemType[], transaction : Transaction)
    : Promise<void> {
        await ReturnItem.bulkCreate(items, {transaction})
    }
}

export default new ReturnRepository()