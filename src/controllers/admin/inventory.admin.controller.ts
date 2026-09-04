import { NextFunction, Response } from "express"
import { AuthRequest } from "../../middleware/auth.middleware.js"
import { ProductVariantIdsDto } from "../../validation/product.validation.js"
import { AdminChangeInventoryDto } from "../../validation/inventory.validation.js"
import adminInventoryService from "../../services/admin/inventory.admin.service.js"

class AdminInventoryController {
    async getVariantInventory (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId, variantId } = req.validated.params as ProductVariantIdsDto
            const result = await adminInventoryService.getVariantInventory(productId, variantId)

            res.status(200).json({
                success : true,
                msg : 'Product Variant Inventory Successfully Found',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async changeVariantInventory (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId, variantId } = req.validated.params as ProductVariantIdsDto
            const inventoryData = req.validated.body as AdminChangeInventoryDto
            const adminId = req.user!.userId
            const result = await adminInventoryService.changeVariantInventory(productId, variantId, inventoryData, adminId, req.ip ?? '-0-')

            res.status(200).json({
                success : true,
                msg : 'Product Variant Inventory Successfully Changed',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new AdminInventoryController()