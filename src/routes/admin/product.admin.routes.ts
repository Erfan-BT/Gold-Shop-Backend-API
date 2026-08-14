import express from 'express'
import { validate } from '../../middleware/validation.js'
import { adminProductQS, productId } from '../../validation/product.validation.js'
import adminProductController from '../../controllers/admin/product.admin.controller.js'

const router = express.Router()

router.get('/', validate({ query : adminProductQS }), adminProductController.getAllProducts)
router.get('/:productId', validate({ params : productId }), adminProductController.getProduct)

export default router