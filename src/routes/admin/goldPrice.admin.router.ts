import express from 'express'
import adminGoldPriceController from '../../controllers/admin/goldPrice.admin.controller.js'

const router = express.Router()

router.get('/', adminGoldPriceController.getPrice)

export default router