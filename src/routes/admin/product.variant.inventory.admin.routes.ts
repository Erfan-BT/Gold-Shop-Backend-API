import express from 'express'
import { validate } from '../../middleware/validation.js'
import { productVariantIdsSchema } from '../../validation/product.validation.js'
import adminInventoryController from '../../controllers/admin/inventory.admin.controller.js'
import { adminChangeInventorySchema } from '../../validation/inventory.validation.js'

const router = express.Router()

router.get('/', validate({ params : productVariantIdsSchema }), adminInventoryController.getVariantInventory)
router.patch('/', validate({ params : productVariantIdsSchema, body : adminChangeInventorySchema }), adminInventoryController.changeVariantInventory)

export default router