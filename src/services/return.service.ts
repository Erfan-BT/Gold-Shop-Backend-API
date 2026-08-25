import sequelize from "../configs/sequelize.config.js";
import { ReturnRequest } from "../models/return.model.js";
import orderRepository from "../repository/order.repository.js";
import returnRepository from "../repository/return.repository.js";
import { OrderStatus } from "../types/order.enum.js";
import { CreateReturnItemType, ReturnItemStatus, ReturnStatus } from "../types/return.enum.js";
import { BadRequestError, ConflictError, InternalServerError, NotFoundError } from "../utils/appError.js";
import { ReturnRequestSchemaDto } from "../validation/return.validation.js";

class ReturnService {
    async createReturnRequest (userId : number, returnRequestBody : ReturnRequestSchemaDto)
    : Promise<number> {
        const now = new Date()
        // Get Order
        const order = await orderRepository.getOrderByOrderNumber(returnRequestBody.orderNumber, userId)
        if (!order)
            throw new NotFoundError('Order Not Found')
        // Check Order Status
        if (order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.COMPLETED)
            throw new BadRequestError("Can Not Request A Refund");
        if (!order.deliveredAt)
            throw new InternalServerError("Delivered Date Missing");
        // Check 7 Days Time
        const returnDeadline = new Date(order.deliveredAt.getTime() + 7 * 24 * 60 * 60 * 1000)
        if (now > returnDeadline)
            throw new BadRequestError('Return Period Has Expired')
        // Check Order Return Request
        const existingRequest = await returnRepository.getOrderReturnRequest(order.id)
        if (existingRequest)
            throw new ConflictError("Return Request Already Exists");
        // Check Items
        const orderItems = new Map(order.items?.map(item => [item.id, item]) ?? [])
        for (let item of returnRequestBody.items) {
            const orderItem = orderItems.get(item.orderItemId);
            if (!orderItem)
                throw new BadRequestError('Invalid Order Item')
            if (item.quantity > orderItem.quantity)
                throw new ConflictError("Requested Quantity Exceeds Purchased Quantity");
        }
        // Create Request & Items
        const request = await sequelize.transaction(async t => {
            // Create Request
            const request = await returnRepository.createReturnRequest(order.id, t)
            // Create Return Items
            const items : CreateReturnItemType[] = returnRequestBody.items.map(item => {
                return {
                    returnRequestId : request.id,
                    orderItemId : item.orderItemId,
                    quantity : item.quantity,
                    reason : item.reason,
                    status : ReturnItemStatus.PENDING,
                    ...(item.description ? { description: item.description } : {})
                }
            })
            await returnRepository.createReturnItems(items, t)

            return request
        })

        return request.id
    }

    async getUserReturnRequests (userId : number)
    : Promise<ReturnRequest[]> {
        return await returnRepository.getUserReturnRequests(userId)
    }

    async getReturnRequestData (userId : number, returnId : number)
    : Promise<ReturnRequest> {
        // Get Request
        const request = await returnRepository.getReturnRequestById(returnId, userId)
        if (!request)
            throw new NotFoundError('Return Request Not Found')
        return request
    }

    async userRegisterTrackingCode (userId : number, returnId : number, trackingCode : string)
    : Promise<void> {
        // Get Request
        const request = await returnRepository.getReturnRequestById(returnId, userId)
        if (!request)
            throw new NotFoundError(`User Return Request Not Found { UserID : ${userId} , ReturnID : ${returnId} }`)
        if (request.returnTrackingCode !== null)
            throw new ConflictError('Tracking Code Already Registered')
        if (request.status !== ReturnStatus.PARTIALLY_APPROVED && request.status !== ReturnStatus.APPROVED)
            throw new BadRequestError(`Tracking Code For This Return Can Not Be Registered { Status : ${request.status} }`)
        // Register Tracking Code
        if (!(await returnRepository.userTrackingCode(returnId, trackingCode)))
            throw new ConflictError('Tracking Code Not Registered')
        return
    }

    async cancelReturnRequest (returnId : number, userId : number, reason : string)
        {
            // Get Return Request
            const returnRequest = await returnRepository.getReturnRequestById(returnId, userId)
            if (!returnRequest)
                throw new NotFoundError(`Return Request Not Found { ID : ${returnId} }`)
    
            // Check Request Status
            if ((returnRequest.status !== ReturnStatus.APPROVED &&
                returnRequest.status !== ReturnStatus.PARTIALLY_APPROVED &&
                returnRequest.status !== ReturnStatus.PENDING ) ||
                returnRequest.returnTrackingCode !== null
            )
                throw new BadRequestError(`This Return Request Can Not Be Canceled`)
    
            // Cancel
            if (!(await returnRepository.adminCancelReturn(returnId, userId, reason)))
                throw new ConflictError('Return Request Not Canceled')
    
            return
        }
}

export default new ReturnService()