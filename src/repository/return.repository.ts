import { FindAndCountOptions, Op, Transaction } from "sequelize"
import { ReturnItem, ReturnRequest } from "../models/return.model.js"
import { CreateReturnItemType, RefundStatus, ReturnItemStatus, ReturnStatus } from "../types/return.enum.js"
import { Order, OrderItem } from "../models/order.model.js"
import User from "../models/user.model.js"
import Address from "../models/address.model.js"
import Coupon from "../models/coupon.model.js"

class ReturnRepository {
    async getUserReturnRequests (userId : number)
    : Promise<ReturnRequest[]> {
        return await ReturnRequest.findAll({
            include : [
                {
                    model : Order,
                    as : 'order',
                    attributes : ['id', 'orderNumber', 'status', 'paymentStatus', 'finalPrice'],
                    required : true,
                    where : {
                        userId
                    }
                }
            ],
            attributes : [
                'id',
                'status',
                'reviewedAt',
                'refundAmount',
                'refundStatus',
                'createdAt',
            ],
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
                    'receivedBy',
                    'receivedAt',
                    'resolvedAt',
                    'canceledBy',
                    'canceledAt',
                    'cancelReason',
                    'createdAt',
                ],
                include : [
                    {
                        model : ReturnItem,
                        as : 'items',
                        required : true,
                        attributes : [
                            'reason',
                            'description',
                            'quantity',
                            'refundAmount',
                            'status',
                            'adminNote',
                            'reviewedBy',
                            'reviewedAt',
                        ],
                        include : [
                            {
                                model : OrderItem,
                                as : 'orderItem',
                                required : true,
                                attributes: [
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
                                ]
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
                            'addressId',
                            'couponId',
                            'subtotal',
                            'discountAmount',
                            'shippingMethod',
                            'shippingCost',
                            'finalPrice',
                            'status',
                            'paymentStatus',
                            'shippedAt',
                            'trackingCode',
                            'deliveredAt',
                            'createdAt',
                        ],
                        where : {
                            userId
                        },
                        include : [
                            {
                                model : Address,
                                as : 'address',
                                required : true,
                                attributes : [
                                    'addressLine',
                                    'city',
                                    'postalCode',
                                    'isDefault',
                                ]
                            },
                            {
                                model : Coupon,
                                as : 'coupon',
                                required : false,
                                attributes : [
                                    'id',
                                    'code',
                                    'type',
                                    'value',
                                ]
                            }
                        ]
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
                'receivedBy',
                'receivedAt',
                'resolvedAt',
                'canceledBy',
                'canceledAt',
                'cancelReason',
                'createdAt',
            ],
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
    : Promise<boolean> {
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
    : Promise<boolean> {
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
                returnTrackingCode : {
                    [Op.is] : null
                }
            }
        })
        return rows === 1
    }

    // --- Admin ---
    async getAllReturnRequests (options : FindAndCountOptions)
    : Promise<{
        rows: ReturnRequest[];
        count: number;
    }> {
        return await ReturnRequest.findAndCountAll(options)
    }

    async getReturnRequest (returnId : number)
    : Promise<ReturnRequest | null> {
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
                'receivedBy',
                'receivedAt',
                'resolvedAt',
                'canceledBy',
                'canceledAt',
                'cancelReason',
                'createdAt',
                'updatedAt',
            ],
            include : [
                {
                    model : ReturnItem,
                    as : 'items',
                    required : true,
                    attributes : [
                        'id',
                        'returnRequestId',
                        'orderItemId',
                        'reason',
                        'description',
                        'quantity',
                        'refundAmount',
                        'status',
                        'adminNote',
                        'reviewedBy',
                        'reviewedAt',
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
    : Promise<boolean> {
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
    
    async finalizeReturnRequest (returnId : number, adminId : number, status : ReturnStatus, refundAmount : number, adminNote : string | null, transaction : Transaction)
    : Promise<boolean> {
        const [rows] = await ReturnRequest.update({
            status,
            adminNote,
            reviewedBy : adminId,
            reviewedAt : new Date(),
            refundAmount,
        }, {
            where : {
                id : returnId,
                status : ReturnStatus.PENDING,
                refundStatus : RefundStatus.PENDING
            },
            transaction
        })
        return rows === 1
    }

    async adminChangeTrackingCode (returnId : number, returnTrackingCode : string, transaction : Transaction)
    : Promise<boolean> {
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
            },
            transaction
        })
        return rows === 1
    }

    async receiveReturnItems (returnId : number, adminId : number, transaction : Transaction)
    : Promise<boolean> {
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
    : Promise<boolean> {
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

    async adminCancelReturn (returnId : number, adminId : number, reason : string, transaction : Transaction)
    : Promise<boolean> {
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
            },
            transaction
        })
        return rows === 1
    }
}

export default new ReturnRepository()