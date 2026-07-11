import { Queue } from "bullmq";
import { connectBullmqRedis } from '../configs/redis.config.js'

export const emailQueue = new Queue('send-email', {
    connection : await connectBullmqRedis(),
    defaultJobOptions : {
        attempts : 3,
        backoff : {
            type : 'exponential',
            delay : 2000
        },
        removeOnComplete : 100,
        removeOnFail : 500
    }
})