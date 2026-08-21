import Inventory from "../../models/inventory.model.js"
import inventoryRepository from "../../repository/inventory.repository.js"
import productRepository from "../../repository/product.repository.js"
import { ConflictError, NotFoundError } from "../../utils/appError.js"
import { adminChangeInventorySchemaDto } from "../../validation/inventory.validation.js"

class AdminInventoryService {
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

export default new AdminInventoryService()