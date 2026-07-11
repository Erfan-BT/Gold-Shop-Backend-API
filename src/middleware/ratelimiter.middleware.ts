import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redisClient from '../configs/redis.config.js';
import { logger } from '../configs/pino.config.js';
import { InternalServerError } from '../utils/appError.js';

let generalLimiter : RateLimitRequestHandler | null = null
let authLimiter : RateLimitRequestHandler | null = null
let EmailLimiter : RateLimitRequestHandler | null = null

const createRateLimiter = (
    windowMs: number,
    max: number,
    prefix: string,
    message: string
) : RateLimitRequestHandler => {
    const options: any = {
        windowMs,
        max,
        message,
        standardHeaders: true,
        legacyHeaders: false,
        // keyGenerator: (req: any) => req.user?.id || req.ip,
        // handler: (req: any, res: any) => {
        //     res.status(429).json({
        //         success : false,
        //         message,
        //         data : Math.ceil(windowMs / 1000),
        //     })
        // },
    }

    if (redisClient.isOpen) {
        try {
            options.store = new RedisStore({
                sendCommand : async (...args: string[]) => {
                    return await redisClient.sendCommand(args)
                },
                prefix: `rl:${prefix}:`,
            })
            logger.info(`Redis Store Ready For "${prefix}"`)
        } catch (error) {
            logger.error(`Redis Store Error For "${prefix}", Using Memory Store`)
            throw new InternalServerError('RedisStore Error', String(error))
        }
    } else {
        logger.warn(`Redis Not Ready For "${prefix}", Using Memory Store`)
    }

    return rateLimit(options)
}

export const getGeneralLimiter = () : RateLimitRequestHandler => {
    if (!generalLimiter) {
        generalLimiter = createRateLimiter(
            15 * 60 * 1000,
            100,
            'general',
            'Too many requests from this IP, please try again later.'
        )
    }
    return generalLimiter
}

export const getAuthLimiter = (): RateLimitRequestHandler => {
    if (!authLimiter) {
        authLimiter = createRateLimiter(
            15 * 60 * 1000,
            5,
            'auth',
            'Too many login attempts, please try again later.'
        )
    }
    return authLimiter
}

export const getEmailLimiter = () : RateLimitRequestHandler => {
    if (!EmailLimiter) {
        EmailLimiter = createRateLimiter(
            60 * 1000,
            20,
            'email',
            'The email has just been sent. Please try again later.'
        )
    }
    return EmailLimiter
}

export const initializeRateLimiters = () => {
    const general = getGeneralLimiter()
    const auth = getAuthLimiter()
    const heavy = getEmailLimiter()

    return { general, auth, heavy }
}