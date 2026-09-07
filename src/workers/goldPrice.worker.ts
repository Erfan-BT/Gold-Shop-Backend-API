import { Worker } from "bullmq";
import { connectBullmqRedis } from "../configs/redis.config.js";
import { logger } from "../configs/pino.config.js";
import { ConflictError, InternalServerError } from "../utils/appError.js";
import goldPriceRepository from "../repository/goldPrice.repository.js";
import goldPriceService from "../services/goldPrice.service.js";
import { FluctuationStatus } from "../types/goldPrice.enum.js";
import sequelize from "../configs/sequelize.config.js";
import { RedisCache } from "../utils/cache.redis.js";
import { goldPriceQueue } from "../queue/goldPrice.queue.js";
import { getGoldPriceUpdateInterval, getGoldPriceUpdateIntervalV2, GOLD_PRICE_DISABLED_INTERVAL } from "../utils/goldPrice.helper.js";

let goldPriceWorker: Worker | null = null;

export async function initGoldPriceWorker() {
    logger.info("Initializing Gold Price Worker");

    if (goldPriceWorker) {
        return goldPriceWorker;
    }

    goldPriceWorker = new Worker(
        'gold-price',
        async (job) => {
            if (job.name !== "update-gold-price") return

            // Get Latest Gold Price
            const goldPrice = await goldPriceRepository.getPrice();
            if (!goldPrice)
                throw new InternalServerError("Gold Price Not Found !!!")

            // Auto Update Disabled
            if (!goldPrice.isAutoUpdateEnabled) {
                await goldPriceQueue.add("update-gold-price",
                    {},
                    {
                        delay : GOLD_PRICE_DISABLED_INTERVAL
                    }
                )

                return
            }

            // New Price From API
            const price = await goldPriceService.getNewPrice();

            // Calculate Fluctuation
            const fluctuationPercent = Math.abs(((price - goldPrice.pricePerGram18k) / goldPrice.pricePerGram18k) * 100)

            let newFluctuationStatus: FluctuationStatus;
            if (fluctuationPercent < 0.05)
                newFluctuationStatus = FluctuationStatus.LOW
            else if (fluctuationPercent >= 0.05 && fluctuationPercent < 0.2)
                newFluctuationStatus = FluctuationStatus.MEDIUM
            else if (fluctuationPercent >= 0.2 && fluctuationPercent < 0.5)
                newFluctuationStatus = FluctuationStatus.HIGH
            else if (fluctuationPercent >= 0.5)
                newFluctuationStatus = FluctuationStatus.VERY_HIGH
            else
                throw new InternalServerError('Error On Fluctuation')

            // Update Database

            await sequelize.transaction(async (t) => {
                // Change Price
                if (!(await goldPriceRepository.changePrice(price, 'system', t)))
                    throw new InternalServerError('Gold Price Not Changed !!!')

                // Change Fluctuation Status
                if (newFluctuationStatus !== goldPrice.fluctuationStatus)
                    if (!(await goldPriceRepository.changeFluctuationStatus(goldPrice.fluctuationStatus, newFluctuationStatus, t)))
                        throw new ConflictError('Gold Price Fluctuation Status Not Changed')

            })

            // Save Price History In Redis
            await RedisCache.push(
                "gold-price:history",
                {
                    oldPrice : goldPrice.pricePerGram18k,
                    newPrice : price,

                    oldFluctuationStatus : goldPrice.fluctuationStatus,
                    newFluctuationStatus,

                    fluctuationPercent,
                    time : new Date()
                }
            )

            // Keep Only Last 5 Changes
            await RedisCache.trim("gold-price:history", 0, 4)

            // Schedule Next Update
            const delay = await getGoldPriceUpdateIntervalV2()

            await goldPriceQueue.add(
                "update-gold-price",
                {},
                {
                    delay
                }
            )

            logger.info(
                {
                    oldPrice : goldPrice.pricePerGram18k,
                    newPrice : price,

                    fluctuationPercent,
                    fluctuationStatus : newFluctuationStatus,

                    nextUpdateInMs : delay
                },
                "Gold Price Updated Successfully"
            );

            
        },
        {
            connection: await connectBullmqRedis(),
            concurrency: 1,
        }
    )

    goldPriceWorker.on("completed", (job) => {
        logger.info({ jobId: job.id , jobName : job.name }, "Gold Price Job Completed");
    })

    goldPriceWorker.on("failed", (job, err) => {
        logger.error(
            {
                jobId: job?.id,
                jobName : job?.name,
                error: err.message,
            },
            "Gold Price Job Failed"
        )
    })

    return goldPriceWorker;
}

export function getGoldPriceWorker() {
    if (!goldPriceWorker) {
        throw new InternalServerError("Gold-Price Worker Has Not Been Initialized");
    }

    return goldPriceWorker;
}