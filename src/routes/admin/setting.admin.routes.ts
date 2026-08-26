import express from 'express'
import adminSettingController from '../../controllers/admin/setting.admin.controller.js'
import { validate } from '../../middleware/validation.js'
import { changeSettingSchema, createSettingSchema, settingIdSchema, settingQSSchema } from '../../validation/setting.validation.js'

const router = express.Router()

router.get('/', validate({ query : settingQSSchema }), adminSettingController.getAllSettings)
router.post('/', validate({ body : createSettingSchema }), adminSettingController.createSetting)
router.post('/:settingId', validate({ params : settingIdSchema, body : changeSettingSchema }), adminSettingController.changeSetting)
router.post('/:settingId/status', validate({ params : settingIdSchema }), adminSettingController.changeSettingStatus)

export default router