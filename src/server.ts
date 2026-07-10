import 'dotenv/config'
import app from "./app.js";
import { logger } from "./configs/pino.config.js";
import initializeDatabase from "./models/index.js";

const port = process.env.SERVER_PORT ?? 3000

async function startServer() {
    try {
        await initializeDatabase()

        // Start Server
        app.listen(port, () => {
            logger.info(`Server Run On Port ${port}`)
        })
    } catch (error) {
        logger.fatal({error : String(error)}, "Server Not Run")
    }
}

await startServer()