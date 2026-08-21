import { PaymentQueryBuilder } from "../../builders/paymentQuary.builder.js";
import paymentRepository from "../../repository/payment.repository.js";
import { NotFoundError } from "../../utils/appError.js";
import { PaymentQSDto } from "../../validation/payment.validation.js";

class AdminPaymentService {
    async getAllPayments (qs : PaymentQSDto)
    {
        const options = PaymentQueryBuilder.build(qs)
        return await paymentRepository.getAllPayments(options)
    }

    async getPayment (paymentId : number)
    {
        const payment = await paymentRepository.adminGetPayment(paymentId)
        if (!payment)
            throw new NotFoundError(`Payment Not Found { ID : ${paymentId} }`)
        return payment
    }
}

export default new AdminPaymentService()