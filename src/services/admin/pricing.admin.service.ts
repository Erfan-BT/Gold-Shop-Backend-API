import { Op } from "sequelize"
import productRepository from "../../repository/product.repository.js"
import { BadRequestError, ConflictError, NotFoundError } from "../../utils/appError.js"
import { ChangeVariantPricing, CreateVariantPricing } from "../../validation/product.validation.js"
import { ProductPricing } from "../../models/product.model.js"
import pricingRepository from "../../repository/pricing.repository.js"

class AdminPricingService {
    async getVariantPricing (productId : number, variantId : number)
    {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)
        // Get Variant
        const variant = await productRepository.findVariant(variantId, productId)
        if (!variant)
            throw new NotFoundError(`Variant Not Found { ID : ${variantId} }`)
        // Get Pricing
        return await pricingRepository.getVariantPricing(variantId)
    }

    async createVariantPricing (productId : number, variantId : number, pricingData : CreateVariantPricing)
    {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)
        // Get Variant
        const variant = await productRepository.findVariant(variantId, productId)
        if (!variant)
            throw new NotFoundError(`Variant Not Found { ID : ${variantId} }`)
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
        if (pricingData.isActive) {
            if (pricing.length > 0) {
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
        }
        // Create
        return await pricingRepository.createVariantPricing(variantId, pricingData)
    }

    async changeVariantPricing (productId : number, variantId : number, pricingId : number, pricingData : ChangeVariantPricing)
    {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)
        // Get Variant
        const variant = await productRepository.findVariant(variantId, productId)
        if (!variant)
            throw new NotFoundError(`Variant Not Found { ID : ${variantId} }`)
        // Get This Pricing
        const [pricing] = await pricingRepository.getVariantPricing(variantId, {id : pricingId})
        if (!pricing)
            throw new NotFoundError(`Pricing Not Found { ID : ${pricingId} }`)
        // Check Data
        const finalWageType = pricingData.wageType ?? pricing.wageType
        const finalWageValue = pricingData.wageValue ?? pricing.wageValue
        const finalProfitType = pricingData.profitType ?? pricing.profitType
        const finalProfitValue = pricingData.profitValue ?? pricing.profitValue

        if (finalWageType === 'percent' && finalWageValue > 100)
            throw new BadRequestError('Wage Percent Must Be Between 0 And 100')

        if (finalProfitType === 'percent' && finalProfitValue > 100)
            throw new BadRequestError('Profit Percent Must Be Between 0 And 100')

        const finalValidFrom = pricingData.validFrom ?? pricing.validFrom;
        const finalValidTo = pricingData.validTo !== undefined ? pricingData.validTo : pricing.validTo;

        if (finalValidTo !== null && finalValidFrom.getTime() > finalValidTo.getTime())
            throw new BadRequestError('Valid To Date Must Be Greater Than Or Equal To Valid From Date')

        const finalPriority = pricingData.priority ?? pricing.priority;
        // Get Variant Pricing && Overlap
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
        
        // Change
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

        if (pricingData.wageType !== undefined)
            data.wageType = pricingData.wageType;

        if (pricingData.wageValue !== undefined)
            data.wageValue = pricingData.wageValue;

        if (pricingData.profitType !== undefined)
            data.profitType = pricingData.profitType;

        if (pricingData.profitValue !== undefined)
            data.profitValue = pricingData.profitValue;

        if (pricingData.taxPercent !== undefined)
            data.taxPercent = pricingData.taxPercent;

        if (pricingData.priority !== undefined)
            data.priority = pricingData.priority;

        if (pricingData.validFrom !== undefined)
            data.validFrom = pricingData.validFrom;

        if (pricingData.validTo !== undefined)
            data.validTo = pricingData.validTo;


        if (!(await pricingRepository.changeVariantPricing(variantId, pricingId, data)))
            throw new ConflictError(`Variant Pricing NoT Changed`)
        return
    }

    async changeVariantPricingStatus (productId : number, variantId : number, pricingId : number)
    {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)
        // Get Variant
        const variant = await productRepository.findVariant(variantId, productId)
        if (!variant)
            throw new NotFoundError(`Variant Not Found { ID : ${variantId} }`)
        // Get This Pricing
        const [pricing] = await pricingRepository.getVariantPricing(variantId, {id : pricingId})
        if (!pricing)
            throw new NotFoundError(`Pricing Not Found { ID : ${pricingId} }`)
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
            if (!(await pricingRepository.changeVariantPricingStatus(variantId, pricingId, true)))
                throw new ConflictError('Product Variant Pricing Status Not Changed')
            return
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
        if (!(await pricingRepository.changeVariantPricingStatus(variantId, pricingId, false)))
            throw new ConflictError('Product Variant Pricing Status Not Changed')
        return
    }

    async deleteVariantPricing (productId : number, variantId : number, pricingId : number)
    {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)
        // Get Variant
        const variant = await productRepository.findVariant(variantId, productId)
        if (!variant)
            throw new NotFoundError(`Variant Not Found { ID : ${variantId} }`)
        // Get This Pricing
        const [pricing] = await pricingRepository.getVariantPricing(variantId, {id : pricingId})
        if (!pricing)
            throw new NotFoundError(`Pricing Not Found { ID : ${pricingId} }`)
        
        // Delete InActive Pricing
        if (!pricing.isActive) {
            if (!(await pricingRepository.deletePricing(variantId, pricingId)))
                throw new ConflictError('Product Variant Pricing Not Deleted')
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

        if (!(await pricingRepository.deletePricing(variantId, pricingId)))
            throw new ConflictError('Product Variant Pricing Not Deleted')     
        return   
    }

}

export default new AdminPricingService()