import { PaymentQueryBuilder } from "../../builders/paymentQuary.builder.js";
import paymentRepository from "../../repository/payment.repository.js";
import { PaymentQSDto } from "../../validation/payment.validation.js";

class AdminPaymentService {
    async getAllPayments (qs : PaymentQSDto)
    {
        const options = PaymentQueryBuilder.build(qs)
        return await paymentRepository.getAllPayments(options)
    }
}

export default new AdminPaymentService()