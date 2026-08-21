import { FindAndCountOptions, Transaction } from "sequelize";
import Payment from "../models/payment.model.js";
import { PaymentData } from "../types/payment.type.js";
import { PaymentStatus } from "../types/payment.enum.js";

class PaymentRepository {
    async createPayment(data : PaymentData, transaction : Transaction)
    : Promise<Payment> {
        return await Payment.create({
            ...data,
            status : PaymentStatus.PAID,
        }, {transaction})
    }

    async getPayment (orderId : number, transaction : Transaction | null)
    : Promise<Payment | null> {
        return await Payment.findOne({
            where : {
                orderId
            },
            transaction
        })
    }

    async getPaymentForRefund (paymentId : number)
    : Promise<Payment | null> {
        return await Payment.findByPk(paymentId)
    }

    async changePaymentStatus (paymentId : number, currentStatus : PaymentStatus, status : PaymentStatus, transaction : Transaction)
    : Promise<boolean> {
        const [rows] = await Payment.update({
            status
        },{
            where : {
                status : currentStatus,
                id : paymentId
            },
            transaction
        })
        return rows === 1
    }

    async refundPayment (paymentId : number, refundAmount : number, refundReason : string, refundId : string, terminal_id : string, transaction : Transaction)
    : Promise<boolean> {
        const [rows] = await Payment.update({
            refundAmount,
            refundReason,
            refundId,
            terminal_id,
            refundedAt : new Date(),
            status : PaymentStatus.REFUND
        },
        {
            where : {
                id : paymentId,
                status : PaymentStatus.REFUND_PROCESSING
            },
            transaction     
        })
        return rows === 1
    }

    async getPendingRefundPayments (limit : number)
    : Promise<Payment[]> {
        return await Payment.findAll({
            where : {
                status : PaymentStatus.REFUND_PENDING
            },
            limit
        })
    }

    // --- Admin ---
    async getAllPayments (options : FindAndCountOptions)
    {
        return await Payment.findAndCountAll(options)
    }
}

export default new PaymentRepository()