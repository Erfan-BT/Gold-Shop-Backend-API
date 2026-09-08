import { Worker } from "bullmq";
import { connectBullmqRedis } from "../configs/redis.config.js";
import { logger } from "../configs/pino.config.js";
import emailService from "../services/email.service.js";
import tokenService from "../services/token.service.js";
import { InternalServerError } from "../utils/appError.js";
import failedJobRepository from "../repository/failedJob.repository.js";
import { FailedJobStatus } from "../types/failedJob.enum.js";

let sendEmailWorker: Worker | null = null;

export async function initSendEmailWorker() {
    logger.info("Initializing Send Email Worker");

    if (sendEmailWorker) {
        return sendEmailWorker;
    }

    sendEmailWorker = new Worker(
        'send-email',
        async (job) => {
            const { userId, name, email } = job.data
            let token : string;
            switch (job.name) {
                case 'send-verify-email':
                    token = await tokenService.generateOTP(
                        userId,
                        'verify-email'
                    )

                    await emailService.sendVerifiedEmail(
                        token,
                        name,
                        email
                    )
                    break;
                case 'send-forgetPassword-email':
                    token = await tokenService.generateOTP(
                        userId,
                        'forget-password'
                    )

                    await emailService.sendForgetPasswordEmail(
                        token,
                        name,
                        email
                    )
                    break;

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

    sendEmailWorker.on("completed", (job) => {
        logger.info({ jobId: job.id , jobName : job.name }, "sendEmail Job Completed");
    })

    sendEmailWorker.on("failed", async (job, err) => {
        // Logs
        logger.error(
            {
                jobId: job?.id,
                jobName : job?.name,
                error: err.message,
            },
            "sendEmail Job Failed"
        )

        // Failed Job
        if (!job) return

        const maxAttempts = job.opts.attempts ?? 1;
        const isFinalAttempt = job.attemptsMade >= maxAttempts;
        if (!isFinalAttempt) return

        await failedJobRepository.addFailedJob({
            jobId : job.id ?? null,
            jobName : job.name,
            queue : 'send-email',
            payload : JSON.stringify(job.data),
            errorMessage : err.message,
            errorTrace : err.stack ?? null,
            attempts : job.attemptsMade,
            priority : 5,
            status : FailedJobStatus.FAILED,
            isAutoRetry : false
        })

        
    })

    return sendEmailWorker;
}

export function getSendEmailWorker() {
    if (!sendEmailWorker) {
        throw new InternalServerError("Send Email Worker Has Not Been Initialized");
    }

    return sendEmailWorker;
}