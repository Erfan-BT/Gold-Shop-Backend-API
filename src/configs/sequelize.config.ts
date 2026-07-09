import "dotenv/config"
import { Sequelize } from "sequelize";
import { logger } from "../configs/pino.config.js";

const sequelize = new Sequelize ({
    host : process.env.DB_HOST ?? 'localhost',
    dialect : "mysql",
    database : process.env.DB_DATABASE ?? "goldshop",
    username : process.env.DB_USER ?? "root",
    password : process.env.DB_PASS ?? 'erfanweb1385',
    timezone: '+03:30',
    logging : false
});

try {
    await sequelize.authenticate();
} catch (error) {
    logger.fatal({error : String(error)}, "Can Not Connect To DB !!!")
}

export default sequelize;