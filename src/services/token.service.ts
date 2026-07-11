import 'dotenv/config'
import jwt from 'jsonwebtoken'
import { logger } from '../configs/pino.config.js'
import { RedisCache } from '../utils/cache.redis.js';
import userRepository from '../repository/user.repository.js';
import { randomBytes } from "crypto";
import { UnauthorizedError } from '../utils/appError.js';

export interface TokenPayload {
    userId : number;
    name : string;
    email : string;
}

class TokenService {
    private readonly accessTokenSecret : string
    private readonly refreshTokenSecret : string
    private readonly otpTokenSecret : string
    private readonly accessTokenExpiry : string
    private readonly refreshTokenExpiry : string
    private readonly otpTokenExpiry : string
    private readonly REFRESH_PREFIX = 'refresh:'

    constructor() {
        this.accessTokenSecret = process.env.JWT_SECRET!
        this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET!
        this.otpTokenSecret = process.env.JWT_OTP_SECRET!
        this.accessTokenExpiry = process.env.JWT_EXPIRES_IN ?? '15m'
        this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d'
        this.otpTokenExpiry = process.env.JWT_OTP_EXPIRES_IN ?? '10m'

        if (!process.env.JWT_SECRET) {
            logger.error('JWT_SECRET Not Set')
        }
    }
    // ---------- Refresh & Access ----------
    generateAccessToken(payload: TokenPayload) : string {
        return jwt.sign(
            {
                userId: payload.userId,
                name: payload.name,
                email: payload.email,
            },
            this.accessTokenSecret,
            { expiresIn: this.accessTokenExpiry as any }
        )
    }

    generateRefreshToken(payload : { userId: number; email: string }) : string {
        return jwt.sign(
            {
                userId: payload.userId,
                email: payload.email
            },
            this.refreshTokenSecret,
            { expiresIn: this.refreshTokenExpiry as any }
        )
    }

    async generateTokens(payload : TokenPayload) {
        const accessToken = this.generateAccessToken(payload);
        const refreshToken = this.generateRefreshToken({
            userId : payload.userId,
            email : payload.email
        })
        
        const key = `${this.REFRESH_PREFIX}${payload.userId}`;
        const ttlSeconds = 7 * 24 * 60 * 60
        await RedisCache.set(key, refreshToken, ttlSeconds)

        return {
            accessToken,
            refreshToken
        }
    }

    verifyAccessToken(token : string) : TokenPayload | null{
        return jwt.verify(token, this.accessTokenSecret) as TokenPayload
    }

    verifyRefreshToken(token : string) : { userId: number; email: string } | null {
        return jwt.verify(token, this.refreshTokenSecret) as { userId : number, email : string }
    }

    async getRefreshToken(userId : number) : Promise<string | null> {
        const key = `${this.REFRESH_PREFIX}${userId}`;
        return await RedisCache.get(key)
    }

    async revokeRefreshToken(userId: number) : Promise<void> {
        const key = `${this.REFRESH_PREFIX}${userId}`;
        await RedisCache.delete(key)
    }

    async refreshAccessToken(refreshToken : string) : Promise<string | null> {
        const decoded = this.verifyRefreshToken(refreshToken);
        if (!decoded) {
            return null
        }
        
        const user = (await userRepository.userById(decoded.userId))
        if (!user) {
            return null
        }
        
        return this.generateAccessToken({
            userId : user.id,
            name : user.name,
            email : user.email
        })
    }
    // ---------- Verify Email & Forget Password
    async generateOTP(userId : number, prefix : string) : Promise<string> {
        const token = randomBytes(32).toString("hex");
        await RedisCache.set(`otp:${prefix}:${token}`, userId.toString(), 10 * 60)
        return token
    }

    async verifyOTP (prefix : string, token : string) : Promise<number> {
        const payload = await RedisCache.getAndDelete<{ userId: number }>(
            `otp:${prefix}:${token}`
        )
        if (!payload)
            throw new UnauthorizedError("Invalid OTP");
        return payload.userId;
    }

}

export default new TokenService()