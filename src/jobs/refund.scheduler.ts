import { logger } from "../configs/pino.config.js";
import { refundQueue } from "../queue/refund.queue.js";

export async function initRefundScheduler() {

    await refundQueue.upsertJobScheduler(
        "refund-scheduler",
        {
            every: 5 * 60 * 1000
        },
        {
            name: "check-pending-refund",
        }
    )

    logger.info('Init Refund Scheduler')

}