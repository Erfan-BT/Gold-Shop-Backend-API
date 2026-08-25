import { FindAndCountOptions, Op, Transaction } from "sequelize"
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

    async userTrackingCode (returnId : number, returnTrackingCode : string)
    {
        const [rows] = await ReturnRequest.update({
            returnTrackingCode
        }, {
            where : {
                id : returnId,
                status: {
                    [Op.in]: [
                        ReturnStatus.APPROVED,
                        ReturnStatus.PARTIALLY_APPROVED
                    ]
                },
                returnTrackingCode : {
                    [Op.is] : null
                }
                
            }
        })
        return rows === 1
    }

    async userCancelReturnRequest (returnId : number, userId : number, reason : string)
    {
        const [rows] = await ReturnRequest.update({
            status : ReturnStatus.CANCELED,
            refundStatus : RefundStatus.CANCELED,
            canceledBy : userId,
            canceledAt : new Date(),
            cancelReason : reason
        }, {
            where : {
                id : returnId,
                status : {
                    [Op.in] : [
                        ReturnStatus.APPROVED,
                        ReturnStatus.PARTIALLY_APPROVED,
                        ReturnStatus.PENDING
                    ]
                },
                returnTrackingCode : null,
            }
        })
        return rows === 1
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
    
    async finalizeReturnRequest (returnId : number, adminId : number, status : ReturnStatus, refundAmount : number, adminNote ?: string)
    {
        const [rows] = await ReturnRequest.update({
            status,
            adminNote : adminNote ?? null,
            reviewedBy : adminId,
            reviewedAt : new Date(),
            refundAmount,
        }, {
            where : {
                id : returnId,
                status : ReturnStatus.PENDING,
                refundStatus : RefundStatus.PENDING
            }
        })
        return rows === 1
    }

    async adminChangeTrackingCode (returnId : number, returnTrackingCode : string)
    {
        const [rows] = await ReturnRequest.update({
            returnTrackingCode
        }, {
            where : {
                id : returnId,
                status: {
                    [Op.in]: [
                        ReturnStatus.APPROVED,
                        ReturnStatus.PARTIALLY_APPROVED
                    ]
                }
            }
        })
        return rows === 1
    }

    async receiveReturnItems (returnId : number, adminId : number, transaction : Transaction)
    {
        const [rows] = await ReturnRequest.update({
            status : ReturnStatus.RECEIVED,
            receivedBy : adminId,
            receivedAt : new Date()
        }, {
            where : {
                id : returnId,
                status: {
                    [Op.in]: [
                        ReturnStatus.APPROVED,
                        ReturnStatus.PARTIALLY_APPROVED
                    ]
                }
            },
            transaction
        })
        return rows === 1
    }

    async completeReturn (returnId : number, transaction : Transaction)
    {
        const [rows] = await ReturnRequest.update({
            status : ReturnStatus.COMPLETED,
            refundStatus : RefundStatus.COMPLETED,
            resolvedAt : new Date()
        }, {
            where : {
                id : returnId,
                status : ReturnStatus.RECEIVED,
                refundStatus : RefundStatus.PENDING
            },
            transaction
        })
        return rows === 1
    }

    async adminCancelReturn (returnId : number, adminId : number, reason : string)
    {
        const [rows] = await ReturnRequest.update({
            status : ReturnStatus.CANCELED,
            refundStatus : RefundStatus.CANCELED,
            canceledBy : adminId,
            canceledAt : new Date(),
            cancelReason : reason
        }, {
            where : {
                id : returnId,
                status : {
                    [Op.in] : [
                        ReturnStatus.APPROVED,
                        ReturnStatus.PARTIALLY_APPROVED,
                        ReturnStatus.PENDING
                    ]
                },
                returnTrackingCode : null,
            }
        })
        return rows === 1
    }
}

export default new ReturnRepository()