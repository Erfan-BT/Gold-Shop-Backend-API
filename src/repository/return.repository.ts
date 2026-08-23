import { FindAndCountOptions, Transaction } from "sequelize"
import { ReturnItem, ReturnRequest } from "../models/return.model.js"
import { CreateReturnItemType, RefundStatus, ReturnItemStatus, ReturnStatus } from "../types/return.enum.js"
import { Order, OrderItem } from "../models/order.model.js"
import User from "../models/user.model.js"

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

    // --- Admin ---
    async getAllReturnRequests (options : FindAndCountOptions)
    {
        return await ReturnRequest.findAndCountAll(options)
    }

    async getReturnRequest (returnId : number)
    {
        return await ReturnRequest.findOne({
            where : {
                id : returnId
            },
            attributes : [
                'id',
                'orderId',
                'status',
                'reviewedBy',
                'reviewedAt',
                'adminNote',
                'refundAmount',
                'refundStatus',
                'returnTrackingCode',
                'resolvedAt',
                'createdAt',
            ],
            include : [
                {
                    model : ReturnItem,
                    as : 'items',
                    required : true,
                    attributes : [
                        'id',
                        'orderItemId',
                        'reason',
                        'description',
                        'quantity',
                        'refundAmount',
                        'status',
                        'adminNote',
                        'createdAt',
                    ],
                    include : [
                        {
                            model : OrderItem,
                            as : 'orderItem',
                            required : true,
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
                                'goldPrice18kAtTime',
                            ],
                        }
                    ]
                },
                {
                    model : Order,
                    as : 'order',
                    required : true,
                    attributes : [
                        'id',
                        'orderNumber',
                        'finalPrice',
                        'status',
                        'paymentStatus',
                        'createdAt',
                    ],
                    include : [
                        {
                            model : User,
                            as : 'user',
                            required : true,
                            attributes : ['id', 'name', 'email', 'phone']
                        }
                    ]
                },
                {
                    model : User,
                    as : 'admin',
                    required : false,
                    attributes : ['id', 'name']
                }
            ]
        })
    }
    
    async reviewReturnItem (returnId : number, itemId : number, adminId : number, status : ReturnItemStatus, refundAmount : number, adminNote : string | null, transaction : Transaction)
    {
        const [rows] = await ReturnItem.update({
            status,
            refundAmount,
            adminNote,
            reviewedBy : adminId,
            reviewedAt : new Date()
        }, {
            where : {
                returnRequestId : returnId,
                id : itemId
            },
            transaction
        })
        return rows === 1
    }
    
}

export default new ReturnRepository()