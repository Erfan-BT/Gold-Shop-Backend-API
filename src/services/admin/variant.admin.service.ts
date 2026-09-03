import sequelize from "../../configs/sequelize.config.js"
import { ProductVariant } from "../../models/product.model.js"
import adminAuditLogRepository from "../../repository/adminAuditLog.repository.js"
import inventoryRepository from "../../repository/inventory.repository.js"
import productRepository from "../../repository/product.repository.js"
import { AdminAuditAction, AdminAuditEntity } from "../../types/adminAuditLog.enum.js"
import { ConflictError, NotFoundError } from "../../utils/appError.js"
import { ChangeVariantDto, CreateVariantDto } from "../../validation/product.validation.js"

class AdminVariantService {
    async getProductVariants (productId : number)
    : Promise<ProductVariant[]> {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)

        // Get Variants
        return await productRepository.getProductVariants(productId)
    }

    async getProductVariant (productId : number, variantId : number)
    : Promise<ProductVariant> {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)

        // Get Variant
        const variant = await productRepository.getProductVariant(productId, variantId)
        if (!variant)
            throw new NotFoundError(`Product Variant Not Found { ID : ${variantId} }`)

        return variant
    }

    async createVariant (productId : number, variantData : CreateVariantDto, adminId : number)
    : Promise<ProductVariant> {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)

        // Check Exists Sku
        if (await productRepository.checkExistsSku(variantData.sku))
            throw new ConflictError('This Sku Already Exists')

        return await sequelize.transaction(async t => {
            // Create Varinat
            const variant = await productRepository.createVariant(productId, variantData, t)

            // Create Inventory
            const inventory = await inventoryRepository.createInventory(variant.id, variantData.quantity, t)

            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.CREATE,
                entityType : AdminAuditEntity.VARIANT,
                entityId : variant.id,
                ipAddress : null,
                reason : null,
                oldValues : null,
                newValues : variantData
            }, t)

            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.CREATE,
                entityType : AdminAuditEntity.INVENTORY,
                entityId : inventory.id,
                ipAddress : null,
                reason : null,
                oldValues : null,
                newValues : {
                    quantity : variantData.quantity,
                }
            }, t)

            return variant
        })
        
    }

    async changeVariant (productId : number, variantId : number, variantData : ChangeVariantDto, adminId : number)
    : Promise<ChangeVariantDto> {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)

        // Get Variant
        const variant = await productRepository.findVariant(variantId, productId)
        if (!variant)
            throw new NotFoundError(`Product Variant Not Found { ID : ${variantId} }`)

        // Create Data
        const data : Partial<Pick<ProductVariant, 'weight' | 'karat' | 'stoneType' | 'color' | 'sku' >> = {}

        if (variantData.weight !== undefined && variantData.weight !== variant.weight)
            data.weight = variantData.weight

        if (variantData.karat !== undefined && variantData.karat !== variant.karat)
            data.karat = variantData.karat

        if (variantData.stoneType !== undefined && variantData.stoneType !== variant.stoneType)
            data.stoneType = variantData.stoneType

        if (variantData.color !== undefined && variantData.color !== variant.color)
            data.color = variantData.color

        if (variantData.sku !== undefined && variantData.sku !== variant.sku)
            data.sku = variantData.sku

        // Check Exists Sku
        if (data.sku !== undefined && await productRepository.checkExistsSku(data.sku, variantId))
            throw new ConflictError('This Sku Already Exists')

        await sequelize.transaction(async t => {
            // Change Varinat
            if (!(await productRepository.changeVariant(productId, variantId, data, t)))
                throw new ConflictError('Product Variant Not Changed')

            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.UPDATE,
                entityType : AdminAuditEntity.VARIANT,
                entityId : variantId,
                ipAddress : null,
                reason : null,
                oldValues : {
                    weight : variant.weight,
                    karat : variant.karat,
                    stoneType : variant.stoneType,
                    color : variant.color,
                    sku : variant.sku
                },
                newValues : data
            }, t)
        })
        
        return data
    }

    async changeVariantStatus (productId : number, variantId : number, adminId : number)
    : Promise<boolean> {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)

        // Get Variant
        const variant = await productRepository.findVariant(variantId, productId)
        if (!variant)
            throw new NotFoundError(`Product Variant Not Found { ID : ${variantId} }`)

        await sequelize.transaction(async t => {
            // Change Status
            if (!(await productRepository.changeVariantStatus(productId, variantId, variant.isActive, t)))
                throw new ConflictError('Product Variant Status Not Changed')

            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : variant.isActive ? AdminAuditAction.DEACTIVATE : AdminAuditAction.ACTIVATE,
                entityType : AdminAuditEntity.VARIANT,
                entityId : variantId,
                ipAddress : null,
                reason : null,
                oldValues : null,
                newValues : null
            }, t)
        })

        return !variant.isActive
    }

    async deleteVariant (productId : number, variantId : number, adminId : number, ipAddress : string)
    : Promise<void> {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)

        // Get Variant
        const variant = await productRepository.findVariant(variantId, productId)
        if (!variant)
            throw new NotFoundError(`Product Variant Not Found { ID : ${variantId} }`)

        await sequelize.transaction(async t => {
            // Delete Variant
            if (!(await productRepository.deleteVariant(productId, variantId, t)))
                throw new ConflictError(`Product Variant Not Deleted`)

            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.DELETE,
                entityType : AdminAuditEntity.VARIANT,
                entityId : variantId,
                ipAddress,
                reason : null,
                oldValues : null,
                newValues : null
            }, t)
        })
        
        return
    }
}

export default new AdminVariantService()