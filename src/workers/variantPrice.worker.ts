import { Worker } from "bullmq";
import { connectBullmqRedis } from "../configs/redis.config.js";
import { logger } from "../configs/pino.config.js";
import { InternalServerError } from "../utils/appError.js";
import variantPriceService from "../services/variantPrice.service.js";
import { variantPriceQueue } from "../queue/variantPrice.queue.js";
import failedJobRepository from "../repository/failedJob.repository.js";
import { FailedJobStatus } from "../types/failedJob.enum.js";

let variantPriceWorker: Worker | null = null;

export async function initVariantPriceWorker() {
    logger.info("Initializing Variant Price Worker");

    if (variantPriceWorker) {
        return variantPriceWorker;
    }

    variantPriceWorker = new Worker(
        'variant-price',
        async (job) => {
            if (job.name !== 'update-variant-price')
                return

            const { isAdmin } : { isAdmin ?: boolean } = job.data
            await variantPriceService.updateVariantsPrice()

            if (!isAdmin)
                await variantPriceQueue.add(
                    "update-variant-price",
                    {},
                    {
                        delay : 30 * 60 * 1000
                    }
                )

        },
        {
            connection: await connectBullmqRedis(),
            concurrency: 1,
        }
    )

    variantPriceWorker.on("completed", (job) => {
        logger.info({ jobId: job.id , jobName : job.name }, "Variant Price Job Completed");
    })

    variantPriceWorker.on("failed", async (job, err) => {
        // Logs
        logger.error(
            {
                jobId: job?.id,
                jobName : job?.name,
                error: err.message,
            },
            "Variant Price Job Failed"
        )

        // Failed Job
        if (!job) return

        const maxAttempts = job.opts.attempts ?? 1;
        const isFinalAttempt = job.attemptsMade >= maxAttempts;
        if (!isFinalAttempt) return
        
        await failedJobRepository.addFailedJob({
            jobId : job.id ?? null,
            jobName : job.name,
            queue : 'variant-price',
            payload : JSON.stringify(job.data),
            errorMessage : err.message,
            errorTrace : err.stack ?? null,
            attempts : job.attemptsMade,
            priority : 5,
            status : FailedJobStatus.FAILED,
            isAutoRetry : false
        })

    })

    return variantPriceWorker;
}

export function getVariantPriceWorker() {
    if (!variantPriceWorker) {
        throw new InternalServerError("Variant-Price Worker Has Not Been Initialized");
    }

    return variantPriceWorker;
}