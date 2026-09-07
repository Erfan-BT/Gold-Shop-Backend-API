import { FluctuationStatus } from "../types/goldPrice.enum.js";
import { GoldPriceHistory } from "../types/goldPrice.type.js";
import { InternalServerError } from "./appError.js";
import { RedisCache } from "./cache.redis.js";

export function getGoldPriceUpdateInterval(
    status: FluctuationStatus
): number {

    switch (status) {

        case FluctuationStatus.LOW:
            return 60 * 1000;

        case FluctuationStatus.MEDIUM:
            return 45 * 1000;

        case FluctuationStatus.HIGH:
            return 30 * 1000;

        case FluctuationStatus.VERY_HIGH:
            return 10 * 1000;

        default:
            return 60 * 1000;
    }
}

export async function getGoldPriceUpdateIntervalV2()
: Promise<number> {
    // Get 5 Last Gold Price
    const lastPrices = await RedisCache.range<GoldPriceHistory>('', 0, 4)
    if (!lastPrices)
        throw new InternalServerError(`Last Gold Prices Not Found !!!`)

    // Calculate
    const hasVeryHigh = lastPrices.some(price => price.newFluctuationStatus === FluctuationStatus.VERY_HIGH)
    const hasHigh = lastPrices.some(price => price.newFluctuationStatus === FluctuationStatus.HIGH)
    const hasMedium = lastPrices.some(price => price.newFluctuationStatus === FluctuationStatus.MEDIUM)

    let fluctuationStatus : FluctuationStatus = FluctuationStatus.LOW
    if (hasVeryHigh)
        fluctuationStatus = FluctuationStatus.VERY_HIGH
    else if (hasHigh)
        fluctuationStatus = FluctuationStatus.HIGH
    else if (hasMedium)
        fluctuationStatus = FluctuationStatus.MEDIUM

    return getGoldPriceUpdateInterval(fluctuationStatus)
}

export const GOLD_PRICE_DISABLED_INTERVAL = 60 * 1000;