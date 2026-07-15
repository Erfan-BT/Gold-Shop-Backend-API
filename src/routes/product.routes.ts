import express from 'express'
import productController from '../controllers/product.controller.js'
import { validate } from '../middleware/validation.js'
import { productQS } from '../validation/product.validation.js'

const router = express.Router()

router.get('/', validate({ query : productQS }), productController.allProducts)

export default router