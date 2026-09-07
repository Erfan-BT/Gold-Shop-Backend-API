import { Queue } from "bullmq";
import { connectBullmqRedis } from '../configs/redis.config.js'

export const variantPriceQueue = new Queue('variant-price', {
    connection : await connectBullmqRedis(),
    defaultJobOptions : {
        attempts : 3,
        backoff : {
            type : 'exponential',
            delay : 5000
        },
        removeOnComplete : 100,
        removeOnFail : 200
    }
})