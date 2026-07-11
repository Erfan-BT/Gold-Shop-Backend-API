import { initSendEmailWorker } from "./sendEmail.worker.js";

export async function initWorkers() {
    await initSendEmailWorker();
}