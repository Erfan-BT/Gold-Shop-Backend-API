import { Queue } from "bullmq";
import { connectBullmqRedis } from '../configs/redis.config.js'

export const goldPriceQueue = new Queue('gold-price', {
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