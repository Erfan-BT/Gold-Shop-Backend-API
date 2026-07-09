import "dotenv/config"
import pino from "pino";
import path from "path";
import fs from "fs";

// const isDevelopment = process.env.NODE_ENV === 'development';
// const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = true;
const isProduction = false;

const logDir = path.join(process.cwd(), '../Logs');
if (isProduction && !fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

export const logger = pino({
    level : isDevelopment ? 'debug' : 'info',
    
    base : {
        service : 'gold-shop',
        env : process.env.NODE_ENV || 'dev',
    },
    
    redact : {
        paths : [
            'password',
            'token',
            'cookie',
            '*.password',
            '*.token',
            'authorization',
            'headers.authorization',
            'req.headers.authorization'
        ],
        censor : '[REDACTED]',
    },
    
    transport : isDevelopment ?
        {
            target: 'pino-pretty',
            options: {
                ignore: 'pid,hostname',
                colorize: true,
                translateTime: 'SYS:standard',
                levelFirst: true,
                messageFormat: '{msg}'
            }
        } :
        {
            targets: [
                {
                    level: 'info',
                    target: 'pino/file',
                    options: {
                        destination: path.join(logDir, 'app.log'),
                        mkdir: true
                    }
                },
                {
                    level: 'error',
                    target: 'pino/file',
                    options: {
                        destination: path.join(logDir, 'error.log'),
                        mkdir: true
                    }
                }
            ]
        }
})