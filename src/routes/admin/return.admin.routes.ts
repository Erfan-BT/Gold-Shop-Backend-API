import express from 'express'
import { validate } from '../../middleware/validation.js'
import adminReturnController from '../../controllers/admin/return.admin.controller.js'
import { returnRequestQSSchema } from '../../validation/return.validation.js'

const router = express.Router()

router.get('/', validate({ query : returnRequestQSSchema }), adminReturnController.getAllReturnRequests)

export default router