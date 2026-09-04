import { Op } from "sequelize"
import productRepository from "../../repository/product.repository.js"
import { BadRequestError, ConflictError, NotFoundError } from "../../utils/appError.js"
import { ChangeVariantDiscountDto, CreateVariantDiscountDto } from "../../validation/discount.validation.js"
import { ProductDiscount } from "../../models/product.model.js"
import discountRepository from "../../repository/discount.repository.js"
import sequelize from "../../configs/sequelize.config.js"
import adminAuditLogRepository from "../../repository/adminAuditLog.repository.js"
import { AdminAuditAction, AdminAuditEntity } from "../../types/adminAuditLog.enum.js"

class AdminDiscountService {
    async getVariantDiscounts (productId : number, variantId : number)
    : Promise<ProductDiscount[]> {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)

        // Get Variant
        const variant = await productRepository.findVariant(variantId, productId)
        if (!variant)
            throw new NotFoundError(`Product Variant Not Found { ID : ${variantId} }`)

        // Get Discounts
        return await discountRepository.getVariantDiscounts(variantId)
    }

    async createVariantDiscount (productId : number, variantId : number, discountData : CreateVariantDiscountDto, adminId : number, ipAddress : string)
    : Promise<ProductDiscount> {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)

        // Get Variant
        const variant = await productRepository.findVariant(variantId, productId)
        if (!variant)
            throw new NotFoundError(`Product Variant Not Found { ID : ${variantId} }`)

        // Get Variant Discounts
        if (discountData.isActive) {
            const now = new Date()
            const discounts = await discountRepository.getVariantDiscounts(variantId, {
                isActive : true,
                [Op.or] : [
                    {
                        endDate : {
                            [Op.gt]: now
                        }
                    },
                    {
                        endDate : {
                            [Op.is]: null
                        }
                    }
                ]

            })
            const hasOverlap = discounts.some(
                existingDiscount =>
                    (
                        existingDiscount.endDate === null ||
                        existingDiscount.endDate.getTime() > discountData.startDate.getTime()
                    ) &&
                    (
                        discountData.endDate === null ||
                        discountData.endDate.getTime() > existingDiscount.startDate.getTime()
                    )
            )
            if (hasOverlap)
                throw new ConflictError('Another Discount Has An Overlapping Date Range')
        }

        return await sequelize.transaction(async t => {
            // Create Discount
            const discount = await discountRepository.createVariantDiscount(variantId, discountData, t)

            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.CREATE,
                entityType : AdminAuditEntity.DISCOUNT,
                entityId : discount.id,
                reason : null,
                ipAddress,
                oldValues : null,
                newValues : {
                    variantId,
                    ...discountData
                }
            }, t)

            return discount
        })
        
    }

    async changeVariantDiscount (productId : number, variantId : number, discountId : number, discountData : ChangeVariantDiscountDto, adminId : number, ipAddress : string)
    : Promise<ChangeVariantDiscountDto> {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)

        // Get Variant
        const variant = await productRepository.findVariant(variantId, productId)
        if (!variant)
            throw new NotFoundError(`Product Variant Not Found { ID : ${variantId} }`)

        // Get This Discount
        const [discount] = await discountRepository.getVariantDiscounts(variantId, { id : discountId })
        if (!discount)
            throw new NotFoundError(`Product Variant Discount Not Found { ID : ${discountId}} `)

        // Create Data
        const data : Partial<Pick<ProductDiscount, 'type' | 'value' | 'startDate' | 'endDate'>> = {}

        if (discountData.type !== undefined && discountData.type !== discount.type)
            data.type = discountData.type

        if (discountData.value !== undefined && discountData.value !== discount.value)
            data.value = discountData.value

        if (discountData.startDate !== undefined && discountData.startDate !== discount.startDate)
            data.startDate = discountData.startDate

        if (discountData.endDate !== undefined && discountData.endDate !== discount.endDate)
            data.endDate = discountData.endDate

        const finalType = data.type ?? discount.type
        const finalValue = data.value !== undefined ? data.value : discount.value
        const finalStartDate = data.startDate ?? discount.startDate
        const finalEndDate = data.endDate !== undefined ? data.endDate : discount.endDate

        if (finalType === 'percent' && finalValue > 100)
            throw new BadRequestError('Discount Percent Must Be Between 0 And 100')

        if (finalType === 'fixed' && finalValue > variant.currentPrice)
            throw new BadRequestError('Discount Value Should Not Be Greater Than Variant Current Amount')

        if (finalEndDate !== null && finalStartDate.getTime() > finalEndDate.getTime())
            throw new BadRequestError('End Date Must Be Greater Than Or Equal To Start Date')

        // Check Discount Overlap
        if (discount.isActive) {
            const now = new Date()
            const discounts = await discountRepository.getVariantDiscounts(variantId,{
                id : {
                    [Op.ne] : discountId
                },
                isActive : true,
                [Op.or] : [
                    {
                        endDate : {
                            [Op.gt]: now
                        }
                    },
                    {
                        endDate : {
                            [Op.is]: null
                        }
                    }
                ]

            })
            const hasOverlap = discounts.some(
                existingDiscount =>
                    (
                        existingDiscount.endDate === null ||
                        existingDiscount.endDate.getTime() > finalStartDate.getTime()
                    ) &&
                    (
                        finalEndDate === null ||
                        finalEndDate.getTime() > existingDiscount.startDate.getTime()
                    )
            )
            if (hasOverlap)
                throw new ConflictError('Another Discount Has An Overlapping Date Range')
        }

        await sequelize.transaction(async t => {
            // Change
            if (!(await discountRepository.changeVariantDiscount(variantId, discountId, data, t)))
                throw new ConflictError('Discount Data Not Changed')

            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.UPDATE,
                entityType : AdminAuditEntity.DISCOUNT,
                entityId : discountId,
                ipAddress,
                reason : null,
                oldValues : {
                    type : discount.type,
                    value : discount.value,
                    startDate : discount.startDate,
                    endDate : discount.endDate
                },
                newValues : data
            }, t)
        })
        
        return data
    }

    async changeVariantDiscountStatus (productId : number, variantId : number, discountId : number, adminId : number)
    : Promise<boolean> {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)

        // Get Variant
        const variant = await productRepository.findVariant(variantId, productId)
        if (!variant)
            throw new NotFoundError(`Product Variant Not Found { ID : ${variantId} }`)

        // Get This Discount
        const [discount] = await discountRepository.getVariantDiscounts(variantId, { id : discountId })
        if (!discount)
            throw new NotFoundError(`Product Variant Discount Not Found { ID : ${discountId}} `)

        // Change Status To False
        if (discount.isActive) {
            await sequelize.transaction(async t => {
                // Change Status
                if (!(await discountRepository.changeVariantDiscountStatus(variantId, discountId, true, t)))
                    throw new ConflictError('Product Variant Discount Status Not Changed')

                // Add Admin Audit
                await adminAuditLogRepository.createAdminAuditLog({
                    adminId,
                    action : AdminAuditAction.DEACTIVATE,
                    entityType : AdminAuditEntity.DISCOUNT,
                    entityId : discountId,
                    ipAddress : null,
                    reason : null,
                    oldValues : null,
                    newValues : null
                }, t)
            })
            
            return false
        }

        // Change Status To True

        // Get Other Discounts
        const now = new Date()
        const discounts = await discountRepository.getVariantDiscounts(variantId,{
                id : {
                    [Op.ne] : discountId
                },
                isActive : true,
                [Op.or] : [
                    {
                        endDate : {
                            [Op.gt]: now
                        }
                    },
                    {
                        endDate : {
                            [Op.is]: null
                        }
                    }
                ]

            })
        if (discount.endDate !== null && discount.endDate.getTime() < now.getTime())
            throw new BadRequestError('An Expired Discount Cannot Be Activated')

        if (discounts.length > 0) {
            const hasOverlap = discounts.some(
                existingDiscount =>
                    (
                        existingDiscount.endDate === null ||
                        existingDiscount.endDate.getTime() > discount.startDate.getTime()
                    ) &&
                    (
                        discount.endDate === null ||
                        discount.endDate.getTime() > existingDiscount.startDate.getTime()
                    )
            )
            if (hasOverlap)
                throw new ConflictError('Another Discount Has An Overlapping Date Range')
        }

        await sequelize.transaction(async t => {
            // Change Status
            if (!(await discountRepository.changeVariantDiscountStatus(variantId, discountId, false, t)))
                throw new ConflictError('Product Variant Discount Status Not Changed')

            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.ACTIVATE,
                entityType : AdminAuditEntity.DISCOUNT,
                entityId : discountId,
                ipAddress : null,
                reason : null,
                oldValues : null,
                newValues : null,
            }, t)
        })
        
        return true
    }

    async deleteDiscount (productId : number, variantId : number, discountId : number, adminId : number)
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
            // Delete Discount
            if (!(await discountRepository.deleteDiscount(variantId, discountId, t)))
                throw new ConflictError('Product Variant Discount Not Deleted')

            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.DELETE,
                entityType : AdminAuditEntity.DISCOUNT,
                entityId : discountId,
                ipAddress : null,
                reason : null,
                oldValues : null,
                newValues : null,
            }, t)
        })
        
        return
    }

}

export default new AdminDiscountService()