import { FindAndCountOptions, Op } from "sequelize";
import FailedJob from "../models/failedJob.model.js";
import { AddFailedJob } from "../types/failedJob.type.js";

class FailedJobRepository {
    async getFailedJobs (options : FindAndCountOptions)
    : Promise<{
        rows: FailedJob[];
        count: number;
    }> {
        return FailedJob.findAndCountAll(options)
    }

    async getFailedJob (jobId : number)
    : Promise<FailedJob | null> {
        return await FailedJob.findOne({
            where : {
                [Op.or] : {
                    id : jobId,
                    jobId
                }
            }
        })
    }

    async addFailedJob (data : AddFailedJob)
    : Promise<FailedJob> {
        return await FailedJob.create(data)
    }
}

export default new FailedJobRepository()