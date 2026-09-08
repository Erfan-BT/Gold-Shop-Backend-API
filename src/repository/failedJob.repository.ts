import FailedJob from "../models/failedJob.model.js";
import { AddFailedJob } from "../types/failedJob.type.js";

class FailedJobRepository {
    async addFailedJob (data : AddFailedJob)
    : Promise<FailedJob> {
        return await FailedJob.create(data)
    }
}

export default new FailedJobRepository()