import { Worker } from "bullmq";
import { connectBullmqRedis } from "../configs/redis.config.js";
import { logger } from "../configs/pino.config.js";
import emailService from "../services/email.service.js";
import tokenService from "../services/token.service.js";
import { InternalServerError } from "../utils/appError.js";

let sendEmailWorker: Worker | null = null;

export async function initSendEmailWorker() {
    if (sendEmailWorker) {
        return sendEmailWorker;
    }

    sendEmailWorker = new Worker(
        "send-email",
        async (job) => {
            const { userId, name, email } = job.data

            const token = await tokenService.generateOTP(
                userId,
                "verify-email"
            )

            await emailService.sendVerifiedEmail(
                token,
                name,
                email
            )
        },
        {
            connection: await connectBullmqRedis(),
            concurrency: 5,
            removeOnComplete: { count: 100 },
            removeOnFail: { count: 200 },
        }
    )

    sendEmailWorker.on("completed", (job) => {
        logger.info({ jobId: job.id }, "sendEmail Job Completed");
    })

    sendEmailWorker.on("failed", (job, err) => {
        logger.error(
            {
                jobId: job?.id,
                error: err.message,
            },
            "sendEmail Job Failed"
        )
    })

    return sendEmailWorker;
}

export function getSendEmailWorker() {
    if (!sendEmailWorker) {
        throw new InternalServerError("Send Email Worker Has Not Been Initialized");
    }

    return sendEmailWorker;
}