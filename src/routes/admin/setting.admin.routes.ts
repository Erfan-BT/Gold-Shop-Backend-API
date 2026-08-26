import express from 'express'
import adminSettingController from '../../controllers/admin/setting.admin.controller.js'
import { validate } from '../../middleware/validation.js'
import { createSettingSchema, settingQSSchema } from '../../validation/setting.validation.js'

const router = express.Router()

router.get('/', validate({ query : settingQSSchema }), adminSettingController.getAllSettings)
router.post('/', validate({ body : createSettingSchema }), adminSettingController.createSetting)

export default router