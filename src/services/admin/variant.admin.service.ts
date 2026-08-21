import { ProductVariant } from "../../models/product.model.js"
import productRepository from "../../repository/product.repository.js"
import userRepository from "../../repository/user.repository.js"
import { RolesTitle } from "../../types/role.enum.js"
import { ConflictError, ForbiddenError, NotFoundError } from "../../utils/appError.js"
import { ChangeVariantSchemaDto, CreateVariantSchemaDto } from "../../validation/product.validation.js"

class AdminVariantService {
    async getProductVariants (productId : number)
    {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)
        // Get Variants
        return await productRepository.getProductVariants(productId)
    }

    async getVariant (productId : number, variantId : number)
    {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)
        // Get Variant
        const variant = await productRepository.getProductVariant(productId, variantId)
        if (!variant)
            throw new NotFoundError(`Variant Not Found { ID : ${variantId} }`)
        return variant
    }

    async createVariant (productId : number, variantData : CreateVariantSchemaDto)
    {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)
        // Check Exists Sku
        if (await productRepository.checkExistsSku(variantData.sku))
            throw new ConflictError('This Sku Already Exists')
        // Create Varinat
        return await productRepository.createVariant(productId, variantData)
    }

    async changeVariant (productId : number, variantId : number, variantData : ChangeVariantSchemaDto)
    {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)
        // Get Variant
        const variant = await productRepository.findVariant(variantId, productId)
        if (!variant)
            throw new NotFoundError(`Variant Not Found { ID : ${variantId} }`)
        // Create Data
        const data : Partial<Pick<ProductVariant, 'weight' | 'karat' | 'stoneType' | 'color' | 'sku' >> = {}

        if (variantData.weight !== undefined)
            data.weight = variantData.weight

        if (variantData.karat !== undefined)
            data.karat = variantData.karat

        if (variantData.stoneType !== undefined)
            data.stoneType = variantData.stoneType

        if (variantData.color !== undefined)
            data.color = variantData.color

        if (variantData.sku !== undefined)
            data.sku = variantData.sku

        // Check Exists Sku
        if (variantData.sku !== undefined && await productRepository.checkExistsSku(variantData.sku, variantId))
            throw new ConflictError('This Sku Already Exists')
        // Change Varinat
        if (!(await productRepository.changeVariant(productId, variantId, data)))
            throw new ConflictError('Product Variant Data Not Changed')
        return
    }

    async changeVariantStatus (productId : number, variantId : number)
    {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)
        // Get Variant
        const variant = await productRepository.findVariant(variantId, productId)
        if (!variant)
            throw new NotFoundError(`Variant Not Found { ID : ${variantId} }`)
        // Change Status
        if (!(await productRepository.changeVariantStatus(productId, variantId, variant.isActive)))
            throw new ConflictError('Product Variant Status Not Changed')
        return
    }

    async deleteVariant (adminId : number, productId : number, variantId : number)
    {
        // Get Admin
        const admin = await userRepository.userById(adminId)
        if (!admin)
            throw new NotFoundError(`Admin Not Found { ${adminId} }`)
        const isOwner = admin.roles?.some(userRole => userRole.role?.name === RolesTitle.OWNER) ?? false
        if (!isOwner)
            throw new ForbiddenError('Not Access')
        // Delete
        if (!(await productRepository.deleteVariant(productId, variantId)))
            throw new NotFoundError(`Product Or Variant Not Found { P-ID : ${productId}, V-ID : ${variantId} }`)
        return
    }

}

export default new AdminVariantService()