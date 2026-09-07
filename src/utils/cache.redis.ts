import redisClient from "../configs/redis.config.js"

export class RedisCache {
    static async set(key : string, value : any, ttlSeconds : number = 3600) : Promise<void> {
        const serialized = JSON.stringify(value)
        await redisClient.setEx(key, ttlSeconds, serialized)
    }

    static async push(key : string, value : any) : Promise<void> {
        const serialized = JSON.stringify(value)
        await redisClient.lPush(key, serialized)
    }

    static async trim(key : string, start : number, stop : number) : Promise<void> {
        await redisClient.lTrim(key, start, stop)
    }

    static async range<T>(key : string, start : number, stop : number) : Promise<T[] | null> {
        const result = await redisClient.lRange(key, start, stop)
        if (result.length === 0) return null
        return result.map(item => JSON.parse(item)) as T[]
    }
    
    static async get<T>(key : string) : Promise<T | null> {
        const data = await redisClient.get(key)
        if (!data) return null
        return JSON.parse(data) as T
    }
    
    static async delete(key : string) : Promise<void> {
        await redisClient.del(key)
    }
    
    static async getAndDelete<T>(key: string): Promise<T | null> {
        const data = await redisClient.getDel(key);
        if (!data) return null;
        return JSON.parse(data) as T;
    }

    static async deletePattern(pattern : string): Promise<void> {
        const keys = await redisClient.keys(pattern)
        if (keys.length > 0) {
            await redisClient.del(keys)
        }
    }

    static async exists(key : string) : Promise<boolean> {
        return await redisClient.exists(key) === 1
    }

    static async getTTL(key : string) : Promise<number> {
        return await redisClient.ttl(key)
    }
}