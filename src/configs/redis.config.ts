import { createClient } from 'redis';
import { Redis } from 'ioredis';
import "dotenv/config"
import { logger } from './pino.config.js';
import { env } from './env.config.js';

export const redisClient = createClient({
    socket : {
        host : env.REDIS_HOST,
        port : env.REDIS_PORT
    },
    password : env.REDIS_PASSWORD,
    database : env.REDIS_DB
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
let isRedisErrorLogged : boolean = false
redisClient.on('connect', () => {
    logger.info('Redis Connected Successfully');
})
redisClient.on('error', (error) => {
    if (!isRedisErrorLogged) {
        logger.fatal({error : String(error)}, 'Failed To Connect To Redis');
        isRedisErrorLogged = true
    }
})

let bullmqConnection : Redis | null = null;

export const connectBullmqRedis = async () => {
    if (bullmqConnection) {
        return bullmqConnection;
    }
    bullmqConnection = new Redis({
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        password: env.REDIS_PASSWORD,
        db: env.REDIS_DB,
        maxRetriesPerRequest: null,
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
        }
    })

    await bullmqConnection.ping()
    return bullmqConnection
}

export default redisClient