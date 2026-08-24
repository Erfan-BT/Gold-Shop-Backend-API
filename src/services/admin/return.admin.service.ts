import { ReturnQueryBuilder } from "../../builders/returnQuery.builder.js";
import sequelize from "../../configs/sequelize.config.js";
import returnRepository from "../../repository/return.repository.js";
import { ReturnItemStatus, ReturnStatus } from "../../types/return.enum.js";
import { BadRequestError, ConflictError, NotFoundError } from "../../utils/appError.js";
import { ReturnRequestQSDto, ReviewReturnItemsSchemaDto } from "../../validation/return.validation.js";

class AdminReturnService {
    async getAllReturnRequests (qs : ReturnRequestQSDto)
    {
        const options = ReturnQueryBuilder.build(qs)
        return await returnRepository.getAllReturnRequests(options)
    }

    async getReturnRequest (returnId : number)
    {
        const returnRequest = await returnRepository.getReturnRequest(returnId)
        if (!returnRequest)
            throw new NotFoundError(`Return Request Not Found { ID : ${returnId} }`)
        return returnRequest
    }

    async reviewReturnItems (returnId : number, adminId : number, reviewData : ReviewReturnItemsSchemaDto)
    {
        // Get Return Request
        const returnRequest = await returnRepository.getReturnRequest(returnId)
        if (!returnRequest)
            throw new NotFoundError(`Return Request Not Found { ID : ${returnId} }`)

        // Check Request Status
        if (returnRequest.status !== ReturnStatus.PENDING)
            throw new ConflictError('Return Request Is Already Finalized')

        // Review Items
        const items = reviewData.items

        // Check Duplicate
        const itemIds = items.map(item => item.itemId)
        if (new Set(itemIds).size !== itemIds.length)
            throw new BadRequestError('Duplicate Return Item')
 
        // Check Items
        for (const item of items) {
            const returnItem = returnRequest.items?.find(returnItem => returnItem.id === item.itemId)
            if (!returnItem)
                throw new BadRequestError(`Return Item Not Found { ID : ${item.itemId} }`);

            if (item.status === ReturnItemStatus.REJECTED)
                item.refundAmount = 0

            if (item.status === ReturnItemStatus.APPROVED) {
                if (item.refundAmount === undefined )
                    throw new BadRequestError()
                if (item.refundAmount > (Number(returnItem.orderItem!.finalPrice) * returnItem.quantity ))
                    throw new BadRequestError()
            }
        }

        // Apply Reviews
        await sequelize.transaction(async t => {
            for (const item of items) {
                if (!(await returnRepository.reviewReturnItem(returnId, item.itemId, adminId, item.status, item.refundAmount ?? 0, item.adminNote ?? null, t)))
                    throw new ConflictError(`Return Item Not Changed { ID : ${item.itemId} }`)
            }
        })
        returnId
    }

    async finalizeReturn (returnId : number, adminId : number, adminNote ?: string)
    {
        // Get Return Request
        const returnRequest = await returnRepository.getReturnRequest(returnId)
        if (!returnRequest)
            throw new NotFoundError(`Return Request Not Found { ID : ${returnId} }`)

        // Check Request Status
        if (returnRequest.status !== ReturnStatus.PENDING)
            throw new ConflictError('Return Request Is Already Finalized')

        // Items
        const returnItems = returnRequest.items
        if (!returnItems || returnItems.length === 0)
            throw new NotFoundError('Return Items Not Found')

        // Check Items Status
        const pendingItem = returnItems.find(item => item.status === ReturnItemStatus.PENDING)
        if (pendingItem)
            throw new BadRequestError('All Return Items Not Checked')

        // Return Request Status
        const hasApprovedItem = returnItems.some(item => item.status === ReturnItemStatus.APPROVED)
        const hasRejectedItem = returnItems.some(item => item.status === ReturnItemStatus.REJECTED)
        let finalReturnStatus : ReturnStatus = ReturnStatus.PENDING

        if (hasApprovedItem && hasRejectedItem)
            finalReturnStatus = ReturnStatus.PARTIALLY_APPROVED
        else if (hasApprovedItem)
            finalReturnStatus = ReturnStatus.APPROVED
        else 
            finalReturnStatus = ReturnStatus.REJECTED

        // Rejected Return Request
        if (finalReturnStatus === ReturnStatus.REJECTED) {
            if (!(await returnRepository.finalizeReturnRequest(returnId, adminId, finalReturnStatus, 0, adminNote)))
                throw new ConflictError('Return Request Status Not Changed [Rejected Request]')
            return {
                finalReturnStatus,
                totalRefundAmount : 0
            }
        }

        // Approved Or Partially Approved
        // Calculate Refund Amount
        const totalRefundAmount = returnItems
            .filter(item => item.status === ReturnItemStatus.APPROVED)
            .reduce(
                (sum, item) => sum + (item.refundAmount ?? 0),
                0
            )

        if (finalReturnStatus === ReturnStatus.APPROVED || finalReturnStatus === ReturnStatus.PARTIALLY_APPROVED)
            if (!(await returnRepository.finalizeReturnRequest(returnId, adminId, finalReturnStatus, totalRefundAmount, adminNote)))
                throw new ConflictError('Return Request Status Not Changed [Approved-PartiallyApproved Request]')

        return {
            finalReturnStatus,
            totalRefundAmount
        }
    }

    async adminChangeTrackingCode (returnId : number, adminId : number, trackingCode : string)
    {
        // Get Return Request
        const returnRequest = await returnRepository.getReturnRequest(returnId)
        if (!returnRequest)
            throw new NotFoundError(`Return Request Not Found { ID : ${returnId} }`)

        // Check Request Status
        if (returnRequest.status !== ReturnStatus.APPROVED && returnRequest.status !== ReturnStatus.PARTIALLY_APPROVED)
            throw new BadRequestError(`Tracking Code For This Return Can Not Be Registered { Status : ${returnRequest.status} }`)

        // Change Return Tracking Code
        if (!(await returnRepository.adminChangeTrackingCode(returnId, trackingCode)))
            throw new ConflictError('Return Tracking Code Not Changed')
        return
    }
}

export default new AdminReturnService()