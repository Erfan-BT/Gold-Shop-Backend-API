import { createClient } from 'redis';
import { Redis } from 'ioredis';
import "dotenv/config"
import { logger } from './pino.config.js';

export const redisClient = createClient({
    socket : {
        host : process.env.REDIS_HOST || 'localhost',
        port : parseInt(process.env.REDIS_PORT || '6379')
    },
    password : process.env.REDIS_PASSWORD!,
    database : parseInt(process.env.REDIS_DB || '0')
})

export const connectRedis = async () => {
    try {
        await redisClient.connect();
        return redisClient;
    } catch (error) {
        logger.fatal({error : String(error)}, 'Failed To Connect To Redis');
        // process.exit(1)
    }
}

export const disconnectRedis = async () => {
    try {
        await redisClient.disconnect();
    } catch (error) {
        logger.error({error : String(error)}, 'Error Disconnecting Redis');
    }
}
let test : boolean = false
redisClient.on('connect', () => {
    logger.info('Redis Connected Successfully');
})
redisClient.on('error', (error) => {
    if (!test) {
        logger.fatal({error : String(error)}, 'Failed To Connect To Redis');
        test = true
        // process.exit(1)
    }
})

let bullmqConnection : Redis | null = null;

export const connectBullmqRedis = async () => {
    if (bullmqConnection) {
        return bullmqConnection;
    }
    bullmqConnection = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        // password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0'),
        maxRetriesPerRequest: null,
        // retryStrategy: (times: number) => {
        //     if (times > 2) {
        //         logger.error(`Number Of Failed Attempts To Connect To BullMQ Redis : ${times}`)
        //         return null
        //     }
        //     const delay = Math.min(times * 1000, 5000)
        //     return delay
        // },
    }) 

    let isRedisErrorLogged : boolean = false;

    bullmqConnection.on('connect', () => {
        logger.info('BullMQ Redis (ioredis) Connected Successfully');
        isRedisErrorLogged = false
    })

    bullmqConnection.on('error', (error) => {
        if (!isRedisErrorLogged) {
            logger.error({error : String(error)}, 'Failed To Connect To BullMQ-Redis');
            isRedisErrorLogged = true
            // process.exit(1)
        }
    })

    await bullmqConnection.ping()
    return bullmqConnection
}

export default redisClient