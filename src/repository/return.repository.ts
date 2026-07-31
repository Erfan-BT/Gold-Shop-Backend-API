import { Transaction } from "sequelize"
import { ReturnItem, ReturnRequest } from "../models/return.model.js"
import { CreateReturnItemType, RefundStatus, ReturnStatus } from "../types/return.enum.js"
import { Order, OrderItem } from "../models/order.model.js"

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

    async getReturnRequestById (returnId : number, userId : number)
    : Promise<ReturnRequest | null> {
        return await ReturnRequest.findOne(
            {
                where : {
                    id : returnId
                },
                include : [
                    {
                        model : ReturnItem,
                        as : 'items',
                        include : [
                            {
                                model : OrderItem,
                                as : 'orderItem',
                                attributes: ['productTitle', 'sku', 'weight', 'karat', 'stoneType', 'color', 'unitPrice']
                            }
                        ]
                    },
                    {
                        model : Order,
                        as : 'order',
                        attributes : ['orderNumber', 'status'],
                        where : {
                            userId
                        }
                    }
                ]
            }
        )
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