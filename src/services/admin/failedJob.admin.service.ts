import { FailedJobQueryBuilder } from "../../builders/failedJobQuary.builder.js";
import FailedJob from "../../models/failedJob.model.js";
import failedJobRepository from "../../repository/failedJob.repository.js";
import { NotFoundError } from "../../utils/appError.js";
import { FailedJobsQSDto } from "../../validation/failedJob.validation.js";

class AdminFailedJobService {
    async getAllFailedJobs (qs : FailedJobsQSDto)
    : Promise<{
        rows: FailedJob[];
        count: number;
    }> {
        // Create Options
        const options = FailedJobQueryBuilder.build(qs)

        // Get Failed Jobs
        return await failedJobRepository.getFailedJobs(options)
    }

    async getFailedJob (jobId : number)
    : Promise<FailedJob> {
        // Get Failed Jobs
        const job = await failedJobRepository.getFailedJob(jobId)
        if (!job)
            throw new NotFoundError(`Failed Job Not Found { ID : ${jobId} }`)

        return job
    }
}

export default new AdminFailedJobService()