import express from 'express'
import { validate } from '../../middleware/validation.js'
import { failedJobsQS, jobIdSchema } from '../../validation/failedJob.validation.js'
import adminFailedJobController from '../../controllers/admin/failedJob.admin.controller.js'

const router = express.Router()

router.get('/', validate({ query : failedJobsQS }), adminFailedJobController.getAllFailedJobs)
router.get('/:jobId', validate({ params : jobIdSchema }), adminFailedJobController.getFailedJob)

export default router