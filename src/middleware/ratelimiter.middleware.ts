import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redisClient from '../configs/redis.config.js';
import { logger } from '../configs/pino.config.js';
import { InternalServerError } from '../utils/appError.js';

let generalLimiter : RateLimitRequestHandler | null = null
let authLimiter : RateLimitRequestHandler | null = null
let EmailLimiter : RateLimitRequestHandler | null = null
let RefreshLimiter : RateLimitRequestHandler | null = null

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
        // keyGenerator: (req: any) => {
        //     console.log(`🔑 Rate Limiter Key: test`)
        //     // return req.user?.id || null
        // },
        handler: (req: any, res: any) => {
            res.status(429).json({
                success : false,
                message,
                data : 'Try Again ' + Math.ceil(windowMs / (1000 * 60)) + 'm Later',
            })
        },
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
            'Too Many Requests From This IP, Please Try Again Later'
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
            'Too Many Login Attempts, Please Try Again Later'
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
            'The Email Has Just Been Sent. Please Try Again Later'
        )
    }
    return EmailLimiter
}

export const getRefreshLimiter = () : RateLimitRequestHandler => {
    if (!RefreshLimiter) {
        RefreshLimiter = createRateLimiter(
            15 * 60 * 1000,
            20,
            'refresh',
            'The Number Of Token Renewal Requests Exceeded The Limit. Please Try Again Later'
        )
    }
    return RefreshLimiter
}

export const initializeRateLimiters = () => {
    const general = getGeneralLimiter()
    const auth = getAuthLimiter()
    const email = getEmailLimiter()
    const refresh = getRefreshLimiter()

    return { general, auth, email, refresh }
}