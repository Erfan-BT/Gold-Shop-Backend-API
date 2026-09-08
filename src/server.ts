import 'dotenv/config'
import app from "./app.js";
import { logger } from "./configs/pino.config.js";
import initializeDatabase from "./models/index.js";
import { connectBullmqRedis, connectRedis } from './configs/redis.config.js';
import { initializeRateLimiters } from './middleware/ratelimiter.middleware.js';
import { initWorkers } from "./workers/index.js";
import { env } from './configs/env.config.js';
import { connectDB } from './configs/sequelize.config.js';
import { initOrderScheduler } from './jobs/order.scheduler.js';
import { initRefundScheduler } from './jobs/refund.scheduler.js';
import { initGoldPriceScheduler } from './jobs/goldPrice.scheduler.js';
import { initVariantPriceScheduler } from './jobs/variantPrice.scheduler.js';
import { UniqueConstraintError } from 'sequelize';

const port = env.SERVER_PORT

async function startServer() {
    try {
        // Start Redis
        await connectRedis()
        await connectBullmqRedis()
        // Start DB
        await connectDB()
        // Init DB
        await initializeDatabase()
        // Init RL
        initializeRateLimiters()
        // Init Workers
        await initWorkers();
        // Init Order Scheduler
        await initOrderScheduler();
        // Init Refund Scheduler
        await initRefundScheduler()
        // Init Gold-Price Scheduler
        await initGoldPriceScheduler()
        // Init Variant-Price Scheduler
        await initVariantPriceScheduler()
        
        // Start Server
        app.listen(port, () => {
            logger.info(`Server Run On Port ${port}`)
        })
    } catch (error) {
        logger.fatal({error : String(error)}, "Server Not Run")
    }
}

await startServer()