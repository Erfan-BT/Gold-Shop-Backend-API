import { logger } from "../configs/pino.config.js";
import { variantPriceQueue } from "../queue/variantPrice.queue.js";

export async function initVariantPriceScheduler() {

    const existingJob = await variantPriceQueue.getJob(
        "update-variant-price-initial"
    )

    if (!existingJob) {

        await variantPriceQueue.add(
            "update-variant-price",
            {},
            {
                jobId: "update-variant-price-initial"
            }
        );

        logger.info("Initial Variant Price Job Created")

    } else {

        logger.info("Variant Price Job Already Exists")

    }

}