import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import { FailedJobsQSDto, JobIdDto } from "../../validation/failedJob.validation.js";
import adminFailedJobService from "../../services/admin/failedJob.admin.service.js";

class AdminFailedJobController {
    async getAllFailedJobs (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const qs = req.validated.query as FailedJobsQSDto
            const result = await adminFailedJobService.getAllFailedJobs(qs)

            res.status(200).json({
                success : true,
                msg : 'All Failed Jobs Successfully Found',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async getFailedJob (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { jobId } = req.validated.params as JobIdDto
            const result = await adminFailedJobService.getFailedJob(jobId)

            res.status(200).json({
                success : true,
                msg : 'Failed Job Successfully Found',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new AdminFailedJobController()