import { Op } from "sequelize"
import productRepository from "../../repository/product.repository.js"
import { BadRequestError, ConflictError, NotFoundError } from "../../utils/appError.js"
import { ProductPricing } from "../../models/product.model.js"
import pricingRepository from "../../repository/pricing.repository.js"
import { ChangeVariantPricingDto, CreateVariantPricingDto } from "../../validation/pricing.validation.js"
import sequelize from "../../configs/sequelize.config.js"
import adminAuditLogRepository from "../../repository/adminAuditLog.repository.js"
import { AdminAuditAction, AdminAuditEntity } from "../../types/adminAuditLog.enum.js"

class AdminPricingService {
    async getVariantPricing (productId : number, variantId : number)
    : Promise<ProductPricing[]> {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)

        // Get Variant
        const variant = await productRepository.findVariant(variantId, productId)
        if (!variant)
            throw new NotFoundError(`Product Variant Not Found { ID : ${variantId} }`)

        // Get Pricing
        return await pricingRepository.getVariantPricing(variantId)
    }

    async createVariantPricing (productId : number, variantId : number, pricingData : CreateVariantPricingDto, adminId : number, ipAddress : string)
    : Promise<ProductPricing> {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)

        // Get Variant
        const variant = await productRepository.findVariant(variantId, productId)
        if (!variant)
            throw new NotFoundError(`Product Variant Not Found { ID : ${variantId} }`)

        // Get Variant Pricing
        const now = new Date()
        const pricing = await pricingRepository.getVariantPricing(variantId,
            {
                isActive : true,
                [Op.or] : [
                    {
                        validTo : {
                            [Op.gte]: now
                        }
                    },
                    {
                        validTo : {
                            [Op.is]: null
                        }
                    }
                ]
            })

        // Check Pricing
        if (pricingData.isActive && pricing.length > 0) {
            const hasPriorityOverlap = pricing.some(
                existingPricing =>
                    existingPricing.priority === pricingData.priority &&
                    (
                        (existingPricing.validTo === null || existingPricing.validTo.getTime() >= pricingData.validFrom.getTime()) &&
                        (pricingData.validTo === null || pricingData.validTo.getTime() >= existingPricing.validFrom.getTime())
                    )
            )
            if (hasPriorityOverlap)
                throw new ConflictError('Another Pricing With The Same Priority Has An Overlapping Date Range')
        }

        return await sequelize.transaction(async t => {
            // Create
            const pricing = await pricingRepository.createVariantPricing(variantId, pricingData, t)

            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.CREATE,
                entityType : AdminAuditEntity.PRICING,
                entityId : pricing.id,
                ipAddress,
                reason : null,
                oldValues : null,
                newValues : {
                    variantId,
                    ...pricingData
                }
            }, t)

            return pricing
        })
    }

    async changeVariantPricing (productId : number, variantId : number, pricingId : number, pricingData : ChangeVariantPricingDto, adminId : number, ipAddress : string)
    : Promise<ChangeVariantPricingDto> {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)

        // Get Variant
        const variant = await productRepository.findVariant(variantId, productId)
        if (!variant)
            throw new NotFoundError(`Product Variant Not Found { ID : ${variantId} }`)

        // Get This Pricing
        const [pricing] = await pricingRepository.getVariantPricing(variantId, {id : pricingId})
        if (!pricing)
            throw new NotFoundError(`Product Variant Pricing Not Found { ID : ${pricingId} }`)

        // Create Data
        const data: Partial<Pick<
            ProductPricing,
              'wageType'
            | 'wageValue'
            | 'profitType'
            | 'profitValue'
            | 'taxPercent'
            | 'priority'
            | 'validFrom'
            | 'validTo'
        >> = {};

        if (pricingData.wageType !== undefined && pricingData.wageType !== pricing.wageType)
            data.wageType = pricingData.wageType;

        if (pricingData.wageValue !== undefined && pricingData.wageValue !== pricing.wageValue)
            data.wageValue = pricingData.wageValue;

        if (pricingData.profitType !== undefined && pricingData.profitType !== pricing.profitType)
            data.profitType = pricingData.profitType;

        if (pricingData.profitValue !== undefined && pricingData.profitValue !== pricing.profitValue)
            data.profitValue = pricingData.profitValue;

        if (pricingData.taxPercent !== undefined && pricingData.taxPercent !== pricing.taxPercent)
            data.taxPercent = pricingData.taxPercent;

        if (pricingData.priority !== undefined && pricingData.priority !== pricing.priority)
            data.priority = pricingData.priority;

        if (pricingData.validFrom !== undefined && pricingData.validFrom !== pricing.validFrom)
            data.validFrom = pricingData.validFrom;

        if (pricingData.validTo !== undefined && pricingData.validTo !== pricing.validTo)
            data.validTo = pricingData.validTo;


        const finalWageType = data.wageType ?? pricing.wageType
        const finalWageValue = data.wageValue ?? pricing.wageValue
        const finalProfitType = data.profitType ?? pricing.profitType
        const finalProfitValue = data.profitValue ?? pricing.profitValue
        const finalPriority = pricingData.priority ?? pricing.priority
        const finalValidFrom = pricingData.validFrom ?? pricing.validFrom
        const finalValidTo = pricingData.validTo !== undefined ? pricingData.validTo : pricing.validTo

        if (finalWageType === 'percent' && finalWageValue > 100)
            throw new BadRequestError('Wage Percent Must Be Between 0 And 100')

        if (finalProfitType === 'percent' && finalProfitValue > 100)
            throw new BadRequestError('Profit Percent Must Be Between 0 And 100')
        
        if (finalValidTo !== null && finalValidFrom.getTime() > finalValidTo.getTime())
            throw new BadRequestError('Valid To Date Must Be Greater Than Or Equal To Valid From Date')
        
        // Check Pricing Overlap
        if (pricing.isActive) {
            const now = new Date()
            const allPricing = await pricingRepository.getVariantPricing(variantId,
                {
                    id : {
                        [Op.ne] : pricingId
                    },
                    isActive : true,
                    [Op.or] : [
                        {
                            validTo : {
                                [Op.gte]: now
                            }
                        },
                        {
                            validTo : {
                                [Op.is]: null
                            }
                        }
                    ]
                })
            if (allPricing.length > 0) {
                const hasPriorityOverlap = allPricing.some(
                    existingPricing =>
                        existingPricing.priority === finalPriority &&
                        (
                            (existingPricing.validTo === null || existingPricing.validTo.getTime() >= finalValidFrom.getTime()) &&
                            (finalValidTo === null || finalValidTo.getTime() >= existingPricing.validFrom.getTime())
                        )
                )
                if (hasPriorityOverlap)
                    throw new ConflictError('Another Pricing With The Same Priority Has An Overlapping Date Range')
            }
        }
        
        await sequelize.transaction(async t => {
            // Change Pricing
            if (!(await pricingRepository.changeVariantPricing(variantId, pricingId, data, t)))
                throw new ConflictError(`Product Variant Pricing NoT Changed`)

            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.UPDATE,
                entityType : AdminAuditEntity.PRICING,
                entityId : pricingId,
                ipAddress,
                reason : null,
                oldValues : {
                    wageType : pricing.wageType,
                    wageValue : pricing.wageValue,
                    profitType : pricing.profitType,
                    profitValue : pricing.profitValue,
                    taxPercent : pricing.taxPercent,
                    priority : pricing.priority,
                    validFrom : pricing.validFrom,
                    validTo : pricing.validTo
                },
                newValues : data
            }, t)
        })

        return data
    }

    async changeVariantPricingStatus (productId : number, variantId : number, pricingId : number, adminId : number)
    : Promise<boolean> {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)

        // Get Variant
        const variant = await productRepository.findVariant(variantId, productId)
        if (!variant)
            throw new NotFoundError(`Product Variant Not Found { ID : ${variantId} }`)

        // Get This Pricing
        const [pricing] = await pricingRepository.getVariantPricing(variantId, {id : pricingId})
        if (!pricing)
            throw new NotFoundError(`Product Variant Pricing Not Found { ID : ${pricingId} }`)

        // Get Other Pricing
        const now = new Date()
        const allPricing = await pricingRepository.getVariantPricing(variantId,
            {
                id : {
                    [Op.ne] : pricingId
                },
                isActive : true,
                [Op.or] : [
                    {
                        validTo : {
                            [Op.gte]: now
                        }
                    },
                    {
                        validTo : {
                            [Op.is]: null
                        }
                    }
                ]
            })

        // Change Status To False
        if (pricing.isActive && allPricing.length === 0)
            throw new BadRequestError('The Product Requires At Least One Active Pricing')

        if (pricing.isActive) {
            await sequelize.transaction(async t => {
                // Change Status
                if (!(await pricingRepository.changeVariantPricingStatus(variantId, pricingId, true, t)))
                    throw new ConflictError('Product Variant Pricing Status Not Changed')

                // Add Admin Audit
                await adminAuditLogRepository.createAdminAuditLog({
                    adminId,
                    action : AdminAuditAction.DEACTIVATE,
                    entityType : AdminAuditEntity.PRICING,
                    entityId : pricingId,
                    ipAddress : null,
                    reason : null,
                    oldValues : null,
                    newValues : null
                }, t)
            })
            
            return false
        }
        
        // Change Status To True
        if (pricing.validTo !== null && pricing.validTo.getTime() < now.getTime())
            throw new BadRequestError('An Expired Pricing Cannot Be Activated')

        if (allPricing.length > 0) {
            const hasPriorityOverlap = allPricing.some(
                existingPricing =>
                    existingPricing.priority === pricing.priority &&
                    (
                        (existingPricing.validTo === null || existingPricing.validTo.getTime() >= pricing.validFrom.getTime()) &&
                        (pricing.validTo === null || pricing.validTo.getTime() >= existingPricing.validFrom.getTime())
                    )
            )
            if (hasPriorityOverlap)
                throw new ConflictError('Another Active Pricing With The Same Priority Has An Overlapping Date Range')
        }

        await sequelize.transaction(async t => {
            // Change Status
            if (!(await pricingRepository.changeVariantPricingStatus(variantId, pricingId, false, t)))
                throw new ConflictError('Product Variant Pricing Status Not Changed')

            // Add Admin Audit
                await adminAuditLogRepository.createAdminAuditLog({
                    adminId,
                    action : AdminAuditAction.ACTIVATE,
                    entityType : AdminAuditEntity.PRICING,
                    entityId : pricingId,
                    ipAddress : null,
                    reason : null,
                    oldValues : null,
                    newValues : null
                }, t)
        })
        
        return true
    }

    async deleteVariantPricing (productId : number, variantId : number, pricingId : number, adminId : number)
    : Promise<void> {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)

        // Get Variant
        const variant = await productRepository.findVariant(variantId, productId)
        if (!variant)
            throw new NotFoundError(`Product Variant Not Found { ID : ${variantId} }`)

        // Get This Pricing
        const [pricing] = await pricingRepository.getVariantPricing(variantId, {id : pricingId})
        if (!pricing)
            throw new NotFoundError(`Product Variant Pricing Not Found { ID : ${pricingId} }`)
        
        // Delete InActive Pricing
        if (!pricing.isActive) {
            await sequelize.transaction(async t => {
                // Delete Pricing
                if (!(await pricingRepository.deletePricing(variantId, pricingId)))
                    throw new ConflictError('Product Variant Pricing Not Deleted')

                // Add Admin Audit
                await adminAuditLogRepository.createAdminAuditLog({
                    adminId,
                    action : AdminAuditAction.DELETE,
                    entityType : AdminAuditEntity.PRICING,
                    entityId : pricingId,
                    oldValues : null,
                    newValues : null,
                    ipAddress : null,
                    reason : null
                }, t)
            })
            
            return
        }

        // Delete Active Pricing

        // Get Other Pricing
        const now = new Date()
        const allPricing = await pricingRepository.getVariantPricing(variantId,
            {
                id : {
                    [Op.ne] : pricingId
                },
                isActive : true,
                [Op.or] : [
                    {
                        validTo : {
                            [Op.gte] : now
                        }
                    },
                    {
                        validTo : {
                            [Op.is] : null
                        }
                    }
                ]
            })
        
        if (allPricing.length === 0)
            throw new BadRequestError('The Product Requires At Least One Active Pricing')

        await sequelize.transaction(async t => {
            // Delete Pricing
            if (!(await pricingRepository.deletePricing(variantId, pricingId)))
                throw new ConflictError('Product Variant Pricing Not Deleted')

            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.DELETE,
                entityType : AdminAuditEntity.PRICING,
                entityId : pricingId,
                oldValues : null,
                newValues : null,
                ipAddress : null,
                reason : null
            }, t)
        })

        return   
    }

}

export default new AdminPricingService()