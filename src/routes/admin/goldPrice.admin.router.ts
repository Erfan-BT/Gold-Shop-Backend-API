import express from 'express'
import adminGoldPriceController from '../../controllers/admin/goldPrice.admin.controller.js'
import { validate } from '../../middleware/validation.js'
import { changePriceSchema } from '../../validation/goldPrice.validation.js'

const router = express.Router()

router.get('/', adminGoldPriceController.getPrice)
router.patch('/', validate({ body : changePriceSchema }), adminGoldPriceController.adminChangePrice)

export default router