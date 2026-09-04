import sequelize from "../../configs/sequelize.config.js"
import Inventory from "../../models/inventory.model.js"
import adminAuditLogRepository from "../../repository/adminAuditLog.repository.js"
import inventoryRepository from "../../repository/inventory.repository.js"
import productRepository from "../../repository/product.repository.js"
import { AdminAuditAction, AdminAuditEntity } from "../../types/adminAuditLog.enum.js"
import { ConflictError, NotFoundError } from "../../utils/appError.js"
import { AdminChangeInventoryDto } from "../../validation/inventory.validation.js"

class AdminInventoryService {
    async getVariantInventory (productId : number, variantId : number)
    : Promise<Inventory> {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)

        // Get Variant
        const variant = await productRepository.findVariant(variantId, productId)
        if (!variant)
            throw new NotFoundError(`Product Variant Not Found { ID : ${variantId} }`)

        // Get Inventory
        const inventory = await inventoryRepository.getVariantInventory(variantId)
        if (!inventory)
            throw new NotFoundError(`Inventory For Variant Not Found { Variant-ID : ${variantId} }`)

        return inventory
    }

    async changeVariantInventory (productId : number, variantId : number, inventoryData : AdminChangeInventoryDto, adminId : number, ipAddress : string)
    : Promise<AdminChangeInventoryDto> {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)

        // Get Variant
        const variant = await productRepository.findVariant(variantId, productId)
        if (!variant)
            throw new NotFoundError(`Product Variant Not Found { ID : ${variantId} }`)

        // Get Inventory
        const inventory = await inventoryRepository.getVariantInventory(variantId)
        if (!inventory)
            throw new NotFoundError(`Inventory For Variant Not Found { Variant-ID : ${variantId} }`)

        // Create Data
        const data : Partial<Pick<Inventory, 'quantity' | 'minThreshold'>> = {}

        if (inventoryData.quantity !== undefined && inventoryData.quantity !== inventory.quantity)
            data.quantity = inventoryData.quantity

        if (inventoryData.minThreshold !== undefined && inventoryData.minThreshold !== inventory.minThreshold)
            data.minThreshold = inventoryData.minThreshold

        await sequelize.transaction(async t => {
            // Change Inventory
            if (!(await inventoryRepository.changeInventory(variantId, data, t)))
                throw new ConflictError('Inventory Data Not Changed')

            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.UPDATE,
                entityType : AdminAuditEntity.INVENTORY,
                entityId : inventory.id,
                ipAddress,
                reason : null,
                oldValues : {
                    variantId,
                    quantity : inventory.quantity,
                    minThreshold : inventory.minThreshold
                },
                newValues : data
            }, t)
        })
        
        return data
    }

}

export default new AdminInventoryService()