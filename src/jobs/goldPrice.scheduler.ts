import { logger } from "../configs/pino.config.js";
import { goldPriceQueue } from "../queue/goldPrice.queue.js";

export async function initGoldPriceScheduler() {

    const existingJob = await goldPriceQueue.getJob(
        "update-gold-price-initial"
    )

    if (!existingJob) {

        await goldPriceQueue.add(
            "update-gold-price",
            {},
            {
                jobId: "update-gold-price-initial"
            }
        );

        logger.info("Initial Gold Price Job Created")

    } else {

        logger.info("Gold Price Job Already Exists")

    }

}