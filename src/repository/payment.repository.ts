import { Transaction } from "sequelize";
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
}

export default new PaymentRepository()