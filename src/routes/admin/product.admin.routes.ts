import express from 'express'
import { validate } from '../../middleware/validation.js'
import { adminProductQS, createProductSchema, productId } from '../../validation/product.validation.js'
import adminProductController from '../../controllers/admin/product.admin.controller.js'

const router = express.Router()

router.get('/', validate({ query : adminProductQS }), adminProductController.getAllProducts)
router.get('/:productId', validate({ params : productId }), adminProductController.getProduct)
router.post('/', validate({ body : createProductSchema }), adminProductController.createProduct)

export default router