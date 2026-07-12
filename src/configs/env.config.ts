import 'dotenv/config';
import { z } from 'zod';
import { logger } from './pino.config.js';

const envSchema = z.object({
    // Server
    NODE_ENV: z.enum(['development', 'production', 'test']),
    SERVER_PORT: z.coerce.number().int().positive(),

    // Database
    DB_HOST: z.string().min(1),
    DB_PORT: z.coerce.number().int().positive(),
    DB_DATABASE: z.string().min(1),
    DB_USER: z.string().min(1),
    DB_PASS: z.string(),

    // Session
    SESSION_SECRET: z.string().min(20, 'SESSION_SECRET must be at least 20 characters'),

    // JWT
    JWT_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    JWT_OTP_SECRET: z.string().min(32),

    JWT_EXPIRES_IN: z.string(),
    JWT_REFRESH_EXPIRES_IN: z.string(),
    JWT_OTP_EXPIRES_IN: z.coerce.number(),

    // Redis
    REDIS_HOST: z.string().min(1),
    REDIS_PORT: z.coerce.number().int().positive(),
    REDIS_PASSWORD: z.string(),
    REDIS_DB: z.coerce.number().int().nonnegative(),

    // Mail
    NODEMAILER_URL: z.string().email(),
    NODEMAILER_APP_PASSWORD: z.string().min(16),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    let errors : string[] = [];
    for (const issue of parsed.error.issues) {
        errors.push(`- ${issue.path.join('.')}: ${issue.message}`);
    }
    console.error({errors}, 'Invalid Environment Variables');
    process.exit(1);
}

export const env = parsed.data;