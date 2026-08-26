import express from 'express'
import adminSettingController from '../../controllers/admin/setting.admin.controller.js'
import { validate } from '../../middleware/validation.js'
import { settingQSSchema } from '../../validation/setting.validation.js'

const router = express.Router()

router.get('/', validate({ query : settingQSSchema }), adminSettingController.getAllSettings)

export default router