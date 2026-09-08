import { Worker } from "bullmq";
import { connectBullmqRedis } from "../configs/redis.config.js";
import { logger } from "../configs/pino.config.js";
import { InternalServerError } from "../utils/appError.js";
import orderService from "../services/order.service.js";
import failedJobRepository from "../repository/failedJob.repository.js";
import { FailedJobStatus } from "../types/failedJob.enum.js";

let orderWorker: Worker | null = null;

export async function initOrderWorker() {
    logger.info("Initializing Order Worker");

    if (orderWorker) {
        return orderWorker;
    }

    orderWorker = new Worker(
        'order',
        async (job) => {
            switch (job.name) {
                case "cancel-expired-orders":
                    await orderService.cancelExpiredOrders()
                    break
                default:
                    break;
            }
            

            
        },
        {
            connection: await connectBullmqRedis(),
            concurrency: 5,
            removeOnComplete: { count: 100 },
            removeOnFail: { count: 200 },
        }
    )

    orderWorker.on("completed", (job) => {
        logger.info({ jobId: job.id , jobName : job.name }, "Order Job Completed");
    })

    orderWorker.on("failed", async (job, err) => {
        // Logs
        logger.error(
            {
                jobId: job?.id,
                jobName : job?.name,
                error: err.message,
            },
            "Order Job Failed"
        )        

        // Failed Job
        if (!job) return

        const maxAttempts = job.opts.attempts ?? 1;
        const isFinalAttempt = job.attemptsMade >= maxAttempts;
        if (!isFinalAttempt) return

        await failedJobRepository.addFailedJob({
            jobId : job.id ?? null,
            jobName : job.name,
            queue : 'order',
            payload : JSON.stringify(job.data),
            errorMessage : err.message,
            errorTrace : err.stack ?? null,
            attempts : job.attemptsMade,
            priority : 5,
            status : FailedJobStatus.FAILED,
            isAutoRetry : false
        })

    })

    return orderWorker;
}

export function getorderWorker() {
    if (!orderWorker) {
        throw new InternalServerError("Order Worker Has Not Been Initialized");
    }

    return orderWorker;
}