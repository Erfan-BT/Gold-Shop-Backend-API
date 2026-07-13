import "dotenv/config"
import { Sequelize } from "sequelize";
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

export async function connectDB () {
    await sequelize.authenticate();
}

export default sequelize;