import { is } from "zod/locales";
import { AdminProductQueryBuilder } from "../../builders/adminProductQuery.builder.js";
import sequelize from "../../configs/sequelize.config.js";
import { Product, ProductDiscount, ProductPricing, ProductVariant } from "../../models/product.model.js";
import categoryRepository from "../../repository/category.repository.js";
import productRepository from "../../repository/product.repository.js";
import userRepository from "../../repository/user.repository.js";
import { RolesTitle } from "../../types/role.enum.js";
import { BadRequestError, ConflictError, ForbiddenError, InternalServerError, NotFoundError } from "../../utils/appError.js";
import { AdminProductQSDto, ChangeProductSchemaDto, ChangeVariantDiscount, ChangeVariantPricing, ChangeVariantSchemaDto, CreateProductSchemaDto, CreateVariantDiscount, CreateVariantPricing, CreateVariantSchemaDto, ImageIdsSchemaDto, variantId } from "../../validation/product.validation.js";
import { ImageService } from "../image.service.js";
import { Op } from "sequelize";
import inventoryRepository from "../../repository/inventory.repository.js";
import { adminChangeInventorySchemaDto } from "../../validation/inventory.validation.js";
import Inventory from "../../models/inventory.model.js";

class AdminProductService {
    async getAllProducts (qs : AdminProductQSDto)
    {
        const options = AdminProductQueryBuilder.build(qs)
        return await productRepository.getProducts(options)
    }

    async getProduct (productId : number)
    {
        const product = await productRepository.getProductAdmin(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)
        return product
    }

    async createProduct (productData : CreateProductSchemaDto)
    {
        return await productRepository.createProduct(productData)
    }

    async changeProduct (productId : number, productData : ChangeProductSchemaDto)
    {
        const data: Partial<Pick<Product, "title" | "slug" | "description">> = {};
        if (productData.title !== undefined)
            data.title = productData.title
        if (productData.slug !== undefined)
            data.slug = productData.slug
        if (productData.description !== undefined)
            data.description = productData.description
        // Change Product
        if (!(await productRepository.changeProduct(productId, data)))
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)
        return
    }

    async changeProductStatus (productId : number)
    {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)
        // Change Product Status
        if (!(await productRepository.changeProductStatus(productId, product.isActive)))
            throw new ConflictError('Product Status Not Changed')
        return !product.isActive
    }

    async deleteProduct (productId : number, adminId : number)
    {
        // Get Admin
        const admin = await userRepository.userById(adminId)
        if (!admin)
            throw new NotFoundError(`Admin Not Found { ID : ${adminId} }`)
        const isOwner = admin.roles?.some(userRole => userRole.role?.name === RolesTitle.OWNER) ?? false
        if (!isOwner)
            throw new ForbiddenError('Not Access')
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)
        // Delete Product
        if (!(await productRepository.deleteProduct(productId)))
            throw new ConflictError('Can Not Delete This Product')
        return
    }

    // ---------- Discounts ----------
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
        return await productRepository.getVariantDiscounts(variantId)
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
            const discounts = await productRepository.getVariantDiscounts(variantId,{
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
        return await productRepository.createVariantDiscount(variantId, discountData)
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
        const [discount] = await productRepository.getVariantDiscounts(variantId, { id : discountId })
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
            const discounts = await productRepository.getVariantDiscounts(variantId,{
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

        if (!(await productRepository.changeVariantDiscount(variantId, discountId, data)))
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
        const [discount] = await productRepository.getVariantDiscounts(variantId, { id : discountId })
        if (!discount)
            throw new NotFoundError(`Discount Not Found { ID : ${discountId}} `)

        // Change Status To False
        if (discount.isActive) {
            if (!(await productRepository.changeVariantDiscountStatus(variantId, discountId, true)))
                throw new ConflictError('Product Variant Discount Status Not Changed')
            return
        }

        // Change Status To True
        // Get Other Discounts
        const now = new Date()
        const discounts = await productRepository.getVariantDiscounts(variantId,{
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
        if (!(await productRepository.changeVariantDiscountStatus(variantId, discountId, false)))
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
        if (!(await productRepository.deleteDiscount(variantId, discountId)))
            throw new ConflictError('Product Variant Discount Not Deleted')
        return
    }

    // ---------- Inventory ----------
    async getVariantInventory (productId : number, variantId : number)
    {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)
        // Get Variant
        const variant = await productRepository.findVariant(variantId, productId)
        if (!variant)
            throw new NotFoundError(`Variant Not Found { ID : ${variantId} }`)
        // Get Inventory
        const inventory = await inventoryRepository.getVariantInventory(variantId)
        if (!inventory)
            throw new NotFoundError(`Inventory For Variant Not Found { Variant-ID : ${variantId} }`)
        return inventory
    }

    async changeVariantInventory (productId : number, variantId : number, inventoryData : adminChangeInventorySchemaDto)
    {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)
        // Get Variant
        const variant = await productRepository.findVariant(variantId, productId)
        if (!variant)
            throw new NotFoundError(`Variant Not Found { ID : ${variantId} }`)
        // Get Inventory
        const inventory = await inventoryRepository.getVariantInventory(variantId)
        if (!inventory)
            throw new NotFoundError(`Inventory For Variant Not Found { Variant-ID : ${variantId} }`)
        // Data & Check
        const data : Partial<Pick<Inventory, 'quantity' | 'minThreshold'>> = {}

        if (inventoryData.quantity !== undefined)
            data.quantity = inventoryData.quantity

        if (inventoryData.minThreshold !== undefined)
            data.minThreshold = inventoryData.minThreshold

        const quantityChanged = (inventoryData.quantity !== undefined) && (inventoryData.quantity !== inventory.quantity)
        const minThresholdChanged = (inventoryData.minThreshold !== undefined) && (inventoryData.minThreshold !== inventory.minThreshold)
        if (!quantityChanged && !minThresholdChanged)
            return

        // Change
        if (!(await inventoryRepository.changeInventory(variantId, data)))
            throw new ConflictError('Inventory Data Not Changed')
        return
    }

}

export default new AdminProductService()