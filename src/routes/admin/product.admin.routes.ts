import express from 'express'
import { validate } from '../../middleware/validation.js'
import { adminProductQS, changeProductSchema, createProductSchema, productId } from '../../validation/product.validation.js'
import adminProductController from '../../controllers/admin/product.admin.controller.js'

const router = express.Router()

router.get('/', validate({ query : adminProductQS }), adminProductController.getAllProducts)
router.get('/:productId', validate({ params : productId }), adminProductController.getProduct)
router.post('/', validate({ body : createProductSchema }), adminProductController.createProduct)
router.patch('/:productId', validate({ params : productId, body : changeProductSchema }), adminProductController.changeProduct)
router.patch('/:productId/status', validate({ params : productId }), adminProductController.changeProductStatus)

export default router