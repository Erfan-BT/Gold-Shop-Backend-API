import 'dotenv/config'
import app from "./app.js";
import { logger } from "./configs/pino.config.js";
import initializeDatabase from "./models/index.js";
import { connectBullmqRedis, connectRedis } from './configs/redis.config.js';
import { initializeRateLimiters } from './middleware/ratelimiter.middleware.js';

const port = process.env.SERVER_PORT ?? 3000

async function startServer() {
    try {
        // Start Redis
        await connectRedis()
        await connectBullmqRedis()
        // Init DB
        await initializeDatabase()
        // Init RL
        const { general, auth, heavy } = initializeRateLimiters()

        // Start Server
        app.listen(port, () => {
            logger.info(`Server Run On Port ${port}`)
        })
    } catch (error) {
        logger.fatal({error : String(error)}, "Server Not Run")
    }
}

await startServer()