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
import orderRepository from "../repository/order.repository.js";
import returnRepository from "../repository/return.repository.js";
import { RefundStatus, ReturnStatus } from "../types/return.enum.js";
import adminAuditLogRepository from "../repository/adminAuditLog.repository.js";
import { AdminAuditAction, AdminAuditEntity } from "../types/adminAuditLog.enum.js";
import failedJobRepository from "../repository/failedJob.repository.js";
import { FailedJobStatus } from "../types/failedJob.enum.js";

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
                        
                        await sequelize.transaction(async t => {
                            // Add Refund Data To Payment & Change Status
                            if (!(await paymentRepository.refundPayment(payment.id, payment.amount, reason ?? "Automatic Retry", refundResult.id, refundResult.terminal_id, null, t)))
                                throw new InternalServerError('Refund Data Not Add To DB')

                            // Add Admin Audit
                            if (adminId !== undefined && !system)
                                await adminAuditLogRepository.createAdminAuditLog({
                                    adminId,
                                    action : AdminAuditAction.REFUND,
                                    entityId : paymentId,
                                    entityType : AdminAuditEntity.PAYMENT,
                                    ipAddress : null,
                                    reason,
                                    oldValues : {
                                        refundAmount : 0,
                                        status : PaymentStatus.REFUND_PENDING
                                    },
                                    newValues : {
                                        refundAmount : payment.amount,
                                        status : PaymentStatus.REFUND
                                    }
                                } , t) 
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
                
                case "return-refund":
                    const { returnId, refundAmount, returnOrderId } = job.data as {
                        returnId : number,
                        refundAmount : number,
                        returnOrderId : number
                    }

                    // Get Payment
                    const returnPayment = await paymentRepository.getPayment(returnOrderId, null)
                    if (!returnPayment)
                        throw new ConflictError('Payment Is Not Refundable')

                    if (returnPayment.refundedAt || returnPayment.refundAmount !== null)
                        throw new ConflictError("Payment Already Refunded")

                    // Lock Payment
                    const lock = await sequelize.transaction(async t => {
                        return await paymentRepository.changePaymentStatus(returnPayment.id, PaymentStatus.REFUND_PENDING, PaymentStatus.REFUND_PROCESSING, t)
                    })
                    if (!lock)
                        return

                    // Get Return Request
                    const returnRequest = await returnRepository.getReturnRequest(returnId)
                    if (!returnRequest)
                        throw new NotFoundError(`Return Request Not Found { ID : ${returnId} }`)

                    if (returnRequest.orderId !== returnOrderId)
                        throw new BadRequestError('Return Request Does Not Belong To Order')

                    if (returnRequest.status !== ReturnStatus.RECEIVED)
                        throw new BadRequestError('Return Request Is Not Ready For Refund')

                    if (returnRequest.refundStatus !== RefundStatus.PENDING)
                        throw new BadRequestError('Return Refund Is Not Pending')

                    if (returnRequest.refundAmount !== refundAmount)
                        throw new ConflictError('Refund Amount Mismatch')

                    try {
                        // Refund
                        const description = `Refund For Order ${returnOrderId} And Payment ${returnPayment.id} And Return Request ${returnId} And Amount ${refundAmount}`
                        const refundResult = await zarinpalService.processRefund(returnPayment.transactionId, refundAmount, description)
                            // Error In SandBox Mode : {No Access Token}
                        if (refundResult.refund_status !== 'OK')
                            throw new InternalServerError('Failed Refund')
                        // Add Refund Data To Payment & Change Status
                        await sequelize.transaction(async t => {
                            if (!(await paymentRepository.refundPayment(returnPayment.id, refundAmount, "Return Request", refundResult.id, refundResult.terminal_id, returnId, t)))
                                throw new InternalServerError('Refund Data Not Add To DB')
                            if (!(await returnRepository.completeReturn(returnId, t)))
                                throw new ConflictError('Return Request Status Not Changed To Complete')
                        })
                    } catch (error) {
                        await sequelize.transaction(async t => {
                            try {
                                if(!(await paymentRepository.changePaymentStatus(returnPayment.id, PaymentStatus.REFUND_PROCESSING, PaymentStatus.PARTIALLY_REFUND_FAILED, t)))
                                    throw new InternalServerError('Payment Status Not Changed')
                            } catch (rollbackError) {
                                logger.error(rollbackError);
                            }
                        })
                        throw error
                    }
                
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

    refundWorker.on("failed", async (job, err) => {
        // Logs
        logger.error(
            {
                jobId: job?.id,
                jobName : job?.name,
                error: err.message,
            },
            "Refund Job Failed"
        )

        // Failed Job
        if (!job) return

        const maxAttempts = job.opts.attempts ?? 1;
        const isFinalAttempt = job.attemptsMade >= maxAttempts;
        if (!isFinalAttempt) return

        await failedJobRepository.addFailedJob({
            jobId: job.id ?? null,
            jobName: job.name,
            queue: "refund",
            payload: JSON.stringify(job.data),
            attempts: job.attemptsMade,
            errorMessage: err.message,
            errorTrace: err.stack ?? null,
            status: FailedJobStatus.FAILED,
            priority : 1,
            isAutoRetry : true
        })
    })

    return refundWorker;
}

export function getorderWorker() {
    if (!refundWorker) {
        throw new InternalServerError("Refund Worker Has Not Been Initialized");
    }

    return refundWorker;
}