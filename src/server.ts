import 'dotenv/config'
import app from "./app.js";
import { logger } from "./configs/pino.config.js";
import initializeDatabase from "./models/index.js";
import { connectBullmqRedis, connectRedis } from './configs/redis.config.js';
import { initializeRateLimiters } from './middleware/ratelimiter.middleware.js';
import { initWorkers } from "./workers/index.js";
import { env } from './configs/env.config.js';
import { connectDB } from './configs/sequelize.config.js';

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
        // Start Server
        app.listen(port, () => {
            logger.info(`Server Run On Port ${port}`)
        })
    } catch (error) {
        logger.fatal({error : String(error)}, "Server Not Run")
    }
}

await startServer()