import express from 'express'
import goldPriceController from '../controllers/goldPrice.controller.js'

const router = express.Router()

router.get('/', goldPriceController.getPrice)

export default router