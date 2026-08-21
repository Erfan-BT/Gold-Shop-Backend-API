import { AdminProductQueryBuilder } from "../../builders/adminProductQuery.builder.js";
import { Product } from "../../models/product.model.js";
import productRepository from "../../repository/product.repository.js";
import userRepository from "../../repository/user.repository.js";
import { RolesTitle } from "../../types/role.enum.js";
import { ConflictError, ForbiddenError, NotFoundError } from "../../utils/appError.js";
import { AdminProductQSDto, ChangeProductSchemaDto, CreateProductSchemaDto } from "../../validation/product.validation.js";
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