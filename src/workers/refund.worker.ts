import { Worker } from "bullmq";
import { connectBullmqRedis } from "../configs/redis.config.js";
import { logger } from "../configs/pino.config.js";
import { BadRequestError, ConflictError, InternalServerError, NotFoundError } from "../utils/appError.js";
import paymentRepository from "../repository/payment.repository.js";
import zarinpalService from "../services/getaway/zarinpal.service.js";
import userRepository from "../repository/user.repository.js";
import sequelize from "../configs/sequelize.config.js";
import { PaymentStatus } from "../types/payment.enum.js";
import { refundQueue } from "../queue/refund.queue.js";

let refundWorker: Worker | null = null;

export async function initRefundWorker() {
    logger.info("Initializing Refund Worker");

    if (refundWorker) {
        return refundWorker;
    }

    refundWorker = new Worker(
        'refund',
        async (job) => {
            switch (job.name) {
                case "refund-payment":
                    const { paymentId, orderId, system, adminId, reason } = job.data
                    if (
                        !Number.isInteger(paymentId) ||
                        !Number.isInteger(orderId)
                    )
                        throw new BadRequestError("Invalid Data");
                    // Cancel By
                    if (!system) {
                        // Get Admin
                        const admin = await userRepository.userById(adminId)
                        if (!admin)
                            throw new NotFoundError('Admin Not Found')
                    }
                    // Get Payment
                    const payment = await paymentRepository.getPaymentForRefund(paymentId)
                    if (!payment)
                        throw new ConflictError('Payment Is Not Refundable')
                    if (payment.refundedAt || payment.status === PaymentStatus.REFUND)
                        throw new ConflictError("Payment Already Refunded")
                    // Lock Payment
                    const locked = await sequelize.transaction(async t => {
                        return await paymentRepository.changePaymentStatus(paymentId, PaymentStatus.REFUND_PENDING, PaymentStatus.REFUND_PROCESSING, t)
                    })
                    if (!locked)
                        return
                    try {
                        // Refund
                        const description = system
                            ? `Refund For Order ${orderId} And Payment ${paymentId} By System`
                            : `Refund For Order ${orderId} And Payment ${paymentId} By Admin [ID : ${adminId} ]. Reason : ${reason}`
                        const refundResult = await zarinpalService.processRefund(payment.transactionId, payment.amount, description)
                            // Error In SandBox Mode : {No Access Token}
                        if (refundResult.refund_status !== 'OK')
                            throw new InternalServerError('Failed Refund')
                        // Add Refund Data To Payment & Change Status
                        await sequelize.transaction(async t => {
                            if (!(await paymentRepository.refundPayment(payment.id, payment.amount, reason ?? "Automatic Retry", refundResult.id, refundResult.terminal_id, t)))
                                throw new InternalServerError('Refund Data Not Add To DB')
                        })
                    } catch (error) {
                        await sequelize.transaction(async t => {
                            try {
                                if(!(await paymentRepository.changePaymentStatus(paymentId, PaymentStatus.REFUND_PROCESSING, PaymentStatus.REFUND_PENDING, t)))
                                    throw new InternalServerError('Payment Status Not Changed')
                            } catch (rollbackError) {
                                logger.error(rollbackError);
                            }
                        })
                        throw error
                    }
                    
                    break
                
                case "check-pending-refund":
                    const payments = await paymentRepository.getPendingRefundPayments(20)
                    for (const payment of payments) {
                        await refundQueue.add(
                            "refund-payment",
                            {
                                paymentId: payment.id,
                                orderId: payment.orderId,
                                system: true
                            },
                            {
                                jobId: `refund-${payment.id}`
                            }
                        );

                    }
                    break;
                default:
                    break;
            }
            

            
        },
        {
            connection: await connectBullmqRedis(),
            concurrency: 5,
            removeOnComplete: { count: 100 },
            removeOnFail: { count: 200 },
        }
    )

    refundWorker.on("completed", (job) => {
        logger.info({ jobId: job.id , jobName : job.name }, "Refund Job Completed");
    })

    refundWorker.on("failed", (job, err) => {
        logger.error(
            {
                jobId: job?.id,
                jobName : job?.name,
                error: err.message,
            },
            "Refund Job Failed"
        )
    })

    return refundWorker;
}

export function getorderWorker() {
    if (!refundWorker) {
        throw new InternalServerError("Refund Worker Has Not Been Initialized");
    }

    return refundWorker;
}