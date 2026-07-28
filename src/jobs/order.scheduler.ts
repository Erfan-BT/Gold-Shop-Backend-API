import { orderQueue } from "../queue/order.queue.js";

export async function initOrderScheduler() {

    await orderQueue.upsertJobScheduler(
        "cancel-expired-orders",
        {
            every: 5 * 60 * 1000
        },
        {
            name: "cancel-expired-orders",
        }
    )

}