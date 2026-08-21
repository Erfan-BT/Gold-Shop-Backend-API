import { Op } from "sequelize"
import productRepository from "../../repository/product.repository.js"
import { BadRequestError, ConflictError, NotFoundError } from "../../utils/appError.js"
import { ChangeVariantDiscount, CreateVariantDiscount } from "../../validation/discount.validation.js"
import { ProductDiscount } from "../../models/product.model.js"
import discountRepository from "../../repository/discount.repository.js"

class AdminDiscountService {
    async getVariantDiscounts (productId : number, variantId : number)
    {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)
        // Get Variant
        const variant = await productRepository.findVariant(variantId, productId)
        if (!variant)
            throw new NotFoundError(`Variant Not Found { ID : ${variantId} }`)
        // Get Discounts
        return await discountRepository.getVariantDiscounts(variantId)
    }

    async createVariantDiscount (productId : number, variantId : number, discountData : CreateVariantDiscount)
    {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)
        // Get Variant
        const variant = await productRepository.findVariant(variantId, productId)
        if (!variant)
            throw new NotFoundError(`Variant Not Found { ID : ${variantId} }`)
        // Get Variant Discounts
        if (discountData.isActive) {
            const now = new Date()
            const discounts = await discountRepository.getVariantDiscounts(variantId,{
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
        // Create Discount
        return await discountRepository.createVariantDiscount(variantId, discountData)
    }

    async changeVariantDiscount (productId : number, variantId : number, discountId : number, discountData : ChangeVariantDiscount)
    {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)
        // Get Variant
        const variant = await productRepository.findVariant(variantId, productId)
        if (!variant)
            throw new NotFoundError(`Variant Not Found { ID : ${variantId} }`)
        // Get This Discount
        const [discount] = await discountRepository.getVariantDiscounts(variantId, { id : discountId })
        if (!discount)
            throw new NotFoundError(`Discount Not Found { ID : ${discountId}} `)
        // Check Data
        const finalType = discountData.type ?? discount.type
        const finalValue = discountData.value !== undefined ? discountData.value : discount.value
        const finalStartDate = discountData.startDate ?? discount.startDate
        const finalEndDate = discountData.endDate !== undefined ? discountData.endDate : discount.endDate

        if (finalType === 'percent' && finalValue > 100)
            throw new BadRequestError('Discount Percent Must Be Between 0 And 100')

        if (finalType === 'fixed' && finalValue > variant.currentPrice)
            throw new BadRequestError('Discount Value Should Not Be Greater Than Variant Current Amount')

        if (finalEndDate !== null && finalStartDate.getTime() > finalEndDate.getTime())
            throw new BadRequestError('End Date Must Be Greater Than Or Equal To Start Date')

        // Get Variant Discounts
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

        // Change
        const data : Partial<Pick<
            ProductDiscount,
              'type'
            | 'value'
            | 'startDate'
            | 'endDate'
        >> = {}

        if (discountData.type !== undefined)
            data.type = discountData.type;

        if (discountData.value !== undefined)
            data.value = discountData.value;

        if (discountData.startDate !== undefined)
            data.startDate = discountData.startDate;

        if (discountData.endDate !== undefined)
            data.endDate = discountData.endDate;

        if (!(await discountRepository.changeVariantDiscount(variantId, discountId, data)))
            throw new ConflictError('Discount Data Not Changed')
        return
    }

    async changeVariantDiscountStatus (productId : number, variantId : number, discountId : number)
    {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)
        // Get Variant
        const variant = await productRepository.findVariant(variantId, productId)
        if (!variant)
            throw new NotFoundError(`Variant Not Found { ID : ${variantId} }`)
        // Get This Discount
        const [discount] = await discountRepository.getVariantDiscounts(variantId, { id : discountId })
        if (!discount)
            throw new NotFoundError(`Discount Not Found { ID : ${discountId}} `)

        // Change Status To False
        if (discount.isActive) {
            if (!(await discountRepository.changeVariantDiscountStatus(variantId, discountId, true)))
                throw new ConflictError('Product Variant Discount Status Not Changed')
            return
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
        if (!(await discountRepository.changeVariantDiscountStatus(variantId, discountId, false)))
            throw new ConflictError('Product Variant Discount Status Not Changed')
        return
    }

    async deleteDiscount (productId : number, variantId : number, discountId : number)
    {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)
        // Get Variant
        const variant = await productRepository.findVariant(variantId, productId)
        if (!variant)
            throw new NotFoundError(`Variant Not Found { ID : ${variantId} }`)
        // Delete
        if (!(await discountRepository.deleteDiscount(variantId, discountId)))
            throw new ConflictError('Product Variant Discount Not Deleted')
        return
    }

}

export default new AdminDiscountService()