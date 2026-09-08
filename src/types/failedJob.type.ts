import { FailedJobStatus } from "./failedJob.enum.js";

export type AddFailedJob = {
    jobId : string | null,
    jobName : string;
    queue : string;
    payload : string;
    attempts : number;
    errorMessage : string;
    errorTrace : string | null;
    status : FailedJobStatus;
    priority : number
    isAutoRetry ?: boolean
}