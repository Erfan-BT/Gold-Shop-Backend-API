import { initGoldPriceWorker } from "./goldPrice.worker.js";
import { initOrderWorker } from "./order.worker.js";
import { initRefundWorker } from "./refund.worker.js";
import { initSendEmailWorker } from "./sendEmail.worker.js";

export async function initWorkers() {
    await initSendEmailWorker();
    await initOrderWorker()
    await initRefundWorker()
    await initGoldPriceWorker()
}