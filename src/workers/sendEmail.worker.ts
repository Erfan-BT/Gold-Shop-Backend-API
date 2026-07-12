import { Worker } from "bullmq";
import { connectBullmqRedis } from "../configs/redis.config.js";
import { logger } from "../configs/pino.config.js";
import emailService from "../services/email.service.js";
import tokenService from "../services/token.service.js";
import { InternalServerError } from "../utils/appError.js";

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

    sendEmailWorker.on("failed", (job, err) => {
        logger.error(
            {
                jobId: job?.id,
                jobName : job?.name,
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