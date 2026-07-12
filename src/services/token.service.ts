import 'dotenv/config'
import jwt from 'jsonwebtoken'
import { logger } from '../configs/pino.config.js'
import { RedisCache } from '../utils/cache.redis.js';
import userRepository from '../repository/user.repository.js';
import { randomBytes } from "crypto";
import { BadRequestError, InternalServerError, UnauthorizedError } from '../utils/appError.js';
import { env } from '../configs/env.config.js';

export interface TokenPayload {
    userId : number;
    name : string;
    email : string;
}



class TokenService {
    private readonly accessTokenSecret : string
    private readonly refreshTokenSecret : string
    private readonly accessTokenExpiry : string
    private readonly refreshTokenExpiry : string
    private readonly otpTokenExpiry : number
    private readonly REFRESH_PREFIX = 'refresh:'

    constructor() {
        this.accessTokenSecret = env.JWT_SECRET
        this.refreshTokenSecret = env.JWT_REFRESH_SECRET
        this.accessTokenExpiry = env.JWT_EXPIRES_IN
        this.refreshTokenExpiry = env.JWT_REFRESH_EXPIRES_IN
        this.otpTokenExpiry = env.JWT_OTP_EXPIRES_IN
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

    verifyAccessToken(token : string) : TokenPayload{
        return jwt.verify(token, this.accessTokenSecret) as TokenPayload
    }

    async verifyRefreshToken(token : string) : Promise<{ userId: number; email: string }> {
        const decode = jwt.verify(token, this.refreshTokenSecret) as { userId : number, email : string }
        if ((await this.getRefreshToken(decode.userId)) !== token)
            throw new UnauthorizedError('Refresh Token Is Invalid')
        return decode
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
        const decoded = await this.verifyRefreshToken(refreshToken);
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
        await RedisCache.set(`otp:${prefix}:${token}`, userId.toString(), this.otpTokenExpiry)
        return token
    }

    async verifyOTP (prefix : string, token : string) : Promise<number> {
        const payload = await RedisCache.getAndDelete<number>(
            `otp:${prefix}:${token}`
        )
        if (!payload)
            throw new BadRequestError("Invalid OTP");
        return payload
    }

}

export default new TokenService()