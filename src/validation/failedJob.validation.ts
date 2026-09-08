import z from "zod";
import { FailedJobSort, FailedJobStatus } from "../types/failedJob.enum.js";

export const failedJobsQS = z.object({
    page : z.coerce.number().int().min(1).default(1),
    limit : z.coerce.number().int().min(1).max(50).default(20),
    sort : z.enum(FailedJobSort).default(FailedJobSort.NEWEST),

    q : z.string().trim().max(100).optional(),

    status : z.enum(FailedJobStatus).optional(),

    failedFrom : z.coerce.date().optional(),
    failedTo : z.coerce.date().optional(),

    isAutoRetry : z.coerce.boolean().optional(),
    isResolved : z.coerce.boolean().optional(),
})
.superRefine((data, ctx) => {
    if (
        data.failedFrom !== undefined &&
        data.failedTo !== undefined &&
        data.failedFrom.getTime() > data.failedTo.getTime()
    ) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["failedTo"],
            message: "Failed To Date Must Be Greater Than Or Equal To Failed From Date"
        })
    }
})

export const jobIdSchema = z.object({
    jobId : z.coerce.number().int().positive()
})

export type FailedJobsQSDto = z.infer<typeof failedJobsQS>
export type JobIdDto = z.infer<typeof jobIdSchema>