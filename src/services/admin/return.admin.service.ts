import { ReturnQueryBuilder } from "../../builders/returnQuery.builder.js";
import sequelize from "../../configs/sequelize.config.js";
import { ReturnRequest } from "../../models/return.model.js";
import { refundQueue } from "../../queue/refund.queue.js";
import adminAuditLogRepository from "../../repository/adminAuditLog.repository.js";
import inventoryRepository from "../../repository/inventory.repository.js";
import returnRepository from "../../repository/return.repository.js";
import { AdminAuditAction, AdminAuditEntity } from "../../types/adminAuditLog.enum.js";
import { ReturnItemStatus, ReturnStatus } from "../../types/return.enum.js";
import { BadRequestError, ConflictError, InternalServerError, NotFoundError } from "../../utils/appError.js";
import { ReturnRequestQSDto, ReviewReturnItemsDto } from "../../validation/return.validation.js";

class AdminReturnService {
    async getAllReturnRequests (qs : ReturnRequestQSDto)
    : Promise<{
        rows : ReturnRequest[];
        count : number;
    }> {
        // Create Options
        const options = ReturnQueryBuilder.build(qs)

        // Get Return Requests
        return await returnRepository.getAllReturnRequests(options)
    }

    async getReturnRequest (returnId : number)
    : Promise<ReturnRequest> {
        // Get Return Request
        const returnRequest = await returnRepository.getReturnRequest(returnId)
        if (!returnRequest)
            throw new NotFoundError(`Return Request Not Found { ID : ${returnId} }`)

        return returnRequest
    }

    async reviewReturnItems (returnId : number, adminId : number, reviewData : ReviewReturnItemsDto)
    : Promise<{
        itemIds : number[]
    }> {
        // Get Return Request
        const returnRequest = await returnRepository.getReturnRequest(returnId)
        if (!returnRequest)
            throw new NotFoundError(`Return Request Not Found { ID : ${returnId} }`)

        // Check Request Status
        if (returnRequest.status !== ReturnStatus.PENDING)
            throw new BadRequestError('Return Request Is Already Finalized')

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
                throw new NotFoundError(`Return Item Not Found { ID : ${item.itemId} }`);

            if (item.status === ReturnItemStatus.REJECTED)
                item.refundAmount = 0

            if (item.status === ReturnItemStatus.APPROVED) {
                if (item.refundAmount === undefined )
                    throw new BadRequestError('Refund Amount Is Required For Approved Item')
                if (item.refundAmount > (Number(returnItem.orderItem!.finalPrice) * returnItem.quantity ))
                    throw new BadRequestError('The Refund Amount Can Not Exceed The Amount Paid')
            }
        }

        // Apply Reviews
        await sequelize.transaction(async t => {
            for (const item of items) {
                // Review Item
                if (!(await returnRepository.reviewReturnItem(returnId, item.itemId, adminId, item.status, item.refundAmount ?? 0, item.adminNote ?? null, t)))
                    throw new ConflictError(`Return Item Not Changed { ID : ${item.itemId} }`)

                // Add Admin Audit
                await adminAuditLogRepository.createAdminAuditLog({
                    adminId,
                    action : item.status === ReturnItemStatus.APPROVED ? AdminAuditAction.APPROVE : AdminAuditAction.REJECT,
                    entityType : AdminAuditEntity.RETURN_ITEM,
                    entityId : item.itemId,
                    reason : item.adminNote ?? null,
                    ipAddress : null,
                    oldValues : null,
                    newValues : {
                        returnId,
                        ...item
                    }
                }, t)
            }
        })

        return {itemIds}
    }

    async finalizeReturn (returnId : number, adminId : number, adminNote : string | null, ipAddress : string)
    : Promise<{
        finalReturnStatus: ReturnStatus.REJECTED | ReturnStatus.PARTIALLY_APPROVED | ReturnStatus.APPROVED;
        totalRefundAmount: number;
    }> {
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
            throw new BadRequestError(`All Return Items Not Checked { Pending-Item-ID : ${pendingItem.id} }`)

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
            await sequelize.transaction(async t => {
                // Finalize
                if (!(await returnRepository.finalizeReturnRequest(returnId, adminId, finalReturnStatus, 0, adminNote, t)))
                    throw new ConflictError('Return Request Status Not Changed [Rejected Request]')

                // Add Admin Audit
                await adminAuditLogRepository.createAdminAuditLog({
                    adminId,
                    action : AdminAuditAction.FINALIZE,
                    entityType : AdminAuditEntity.RETURN,
                    entityId : returnId,
                    ipAddress,
                    reason : adminNote,
                    oldValues : null,
                    newValues : {
                        finalReturnStatus,
                        totalRefundAmount : 0
                    }
                }, t)
            })
            
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
            await sequelize.transaction(async t => {
                // Finalize
                if (!(await returnRepository.finalizeReturnRequest(returnId, adminId, finalReturnStatus, totalRefundAmount, adminNote, t)))
                    throw new ConflictError('Return Request Status Not Changed [Approved-PartiallyApproved Request]')

                // Add Admin Audit
                await adminAuditLogRepository.createAdminAuditLog({
                    adminId,
                    action : AdminAuditAction.FINALIZE,
                    entityType : AdminAuditEntity.RETURN,
                    entityId : returnId,
                    ipAddress,
                    reason : adminNote,
                    oldValues : null,
                    newValues : {
                        finalReturnStatus,
                        totalRefundAmount
                    }
                }, t)
            })

        return {
            finalReturnStatus,
            totalRefundAmount
        }
    }

    async adminChangeTrackingCode (returnId : number, adminId : number, trackingCode : string, reason : string | null, ipAddress : string)
    : Promise<void> {
        // Get Return Request
        const returnRequest = await returnRepository.getReturnRequest(returnId)
        if (!returnRequest)
            throw new NotFoundError(`Return Request Not Found { ID : ${returnId} }`)

        // Check Request Status
        if (returnRequest.status !== ReturnStatus.APPROVED && returnRequest.status !== ReturnStatus.PARTIALLY_APPROVED)
            throw new BadRequestError(`Tracking Code For This Return Can Not Be Registered { Status : ${returnRequest.status} }`)

        await sequelize.transaction(async t => {
            // Change Return Tracking Code
            if (!(await returnRepository.adminChangeTrackingCode(returnId, trackingCode, t)))
                throw new ConflictError('Return Tracking Code Not Changed')

            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.UPDATE,
                entityType : AdminAuditEntity.RETURN,
                entityId : returnId,
                ipAddress,
                reason,
                oldValues : {
                    returnTrackingCode : returnRequest.returnTrackingCode
                },
                newValues : {
                    returnTrackingCode : trackingCode
                }
            }, t)
        })
        
        return
    }

    async verifyReturnedItems (returnId : number, adminId : number, ipAddress : string)
    : Promise<void> {
        // Get Return Request
        const returnRequest = await returnRepository.getReturnRequest(returnId)
        if (!returnRequest)
            throw new NotFoundError(`Return Request Not Found { ID : ${returnId} }`)

        // Check Request Status
        if (returnRequest.status !== ReturnStatus.APPROVED && returnRequest.status !== ReturnStatus.PARTIALLY_APPROVED)
            throw new BadRequestError(`This Return Request Can Not Be Completed { Status : ${returnRequest.status} }`)

        // Return Items
        const items = returnRequest.items
        if (!items || items.length === 0)
            throw new NotFoundError('Return Items Not Found')

        const approvedItems = items.filter(item => item.status === ReturnItemStatus.APPROVED)
        if (approvedItems.length === 0)
            throw new NotFoundError('Approved Items Not Found')

        // Process
        await sequelize.transaction(async t => {
            // Change Return Status To Received
            if (!(await returnRepository.receiveReturnItems(returnId, adminId, t)))
                throw new ConflictError('Return Request Status Not Changed To Received')

            // Return Inventory
            for (let item of approvedItems) {
                const orderItem = item.orderItem
                if (!orderItem)
                    throw new NotFoundError(`Order Item Not Found For Return Item { ID : ${item.id} }`)

                if (!(await inventoryRepository.increaseStock(orderItem.variantId, item.quantity, t)))
                    throw new InternalServerError("Inventory Not Changed")
            }

            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.VERIFY,
                entityType : AdminAuditEntity.RETURN, 
                entityId : returnId,
                ipAddress,
                reason : null,
                oldValues : null,
                newValues : null
            }, t)
        })

        // Add ReturnRequest To Refund-Queue
        refundQueue.add('return-refund', {
            returnId,
            refundAmount : returnRequest.refundAmount,
            returnOrderId : returnRequest.orderId
        })

        return
    }

    async cancelReturnRequest (returnId : number, adminId : number, reason : string, ipAddress : string)
    : Promise<void> {
        // Get Return Request
        const returnRequest = await returnRepository.getReturnRequest(returnId)
        if (!returnRequest)
            throw new NotFoundError(`Return Request Not Found { ID : ${returnId} }`)

        // Check Request Status
        if ((returnRequest.status !== ReturnStatus.APPROVED &&
            returnRequest.status !== ReturnStatus.PARTIALLY_APPROVED &&
            returnRequest.status !== ReturnStatus.PENDING ) ||
            returnRequest.returnTrackingCode !== null
        )
            throw new BadRequestError(`This Return Request Can Not Be Canceled`)

        await sequelize.transaction(async t => {
            // Cancel Request
            if (!(await returnRepository.adminCancelReturn(returnId, adminId, reason, t)))
                throw new ConflictError('Return Request Not Canceled')

            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.CANCEL,
                entityType : AdminAuditEntity.RETURN,
                entityId : returnId,
                ipAddress,
                reason,
                oldValues : null,
                newValues : null
            }, t)
        })
        
        return
    }
}

export default new AdminReturnService()