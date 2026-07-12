import "dotenv/config"
import { Sequelize } from "sequelize";
import { logger } from "../configs/pino.config.js";
import { env } from "./env.config.js";

const sequelize = new Sequelize ({
    host : env.DB_HOST,
    dialect : "mysql",
    database : env.DB_DATABASE,
    username : env.DB_USER,
    password : env.DB_PASS,
    timezone: '+03:30',
    logging : false
});

try {
    await sequelize.authenticate();
} catch (error) {
    logger.fatal({error : String(error)}, "Can Not Connect To DB !!!")
}

export default sequelize;