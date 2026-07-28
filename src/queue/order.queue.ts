import { Queue } from "bullmq";
import { connectBullmqRedis } from '../configs/redis.config.js'

export const orderQueue = new Queue('order', {
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