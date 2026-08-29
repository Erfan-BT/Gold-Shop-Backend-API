import { zarinpal } from "../../configs/zarinpal.config.js";
import { CreatePaymentResponseAPI, InquirePaymentResponseAPI, RefundPaymentResponseAPI, VerifyPaymentResponseAPI } from "../../types/payment.type.js";

class ZarinpalService {
    async createPayment (amount : number, orderNumber : string) {
        const response = await zarinpal.payments.create({
            amount,
            callback_url : 'https://localhost:3000/api/payments/callback',
            description : `Payment For Order : ${orderNumber}`,
        })
        return response as CreatePaymentResponseAPI
    }

    async verifyPayment(authority : string, amount : number) {
        const response = await zarinpal.verifications.verify({
            amount,
            authority,
        })
        if (!response || !response.data || response.data.code < 100) {
            return {
                success : false,
                msg : 'Failed Payment',
                data : null
            }
        }
        if (response.data.code >= 100)
            return {
                success : true,
                msg : 'Payment Varified Successfully',
                data : response.data as VerifyPaymentResponseAPI
            }
    }
    
    async inquireTransaction(authority : string) {
        const inquiryResult = await zarinpal.inquiries.inquire({
            authority,
        })

        if (!inquiryResult || !inquiryResult.data || inquiryResult.data.code < 100)
            return {
                success : false,
                msg : inquiryResult.data.message ?? 'Failed Payment'
            }

        return {
            success : true,
            msg : 'Payment Varified',
            data : inquiryResult.data as InquirePaymentResponseAPI
        }
    }

    async processRefund (sessionId : string, amount : number, description : string = 'Refund For Order') {
        const refundResponse = await zarinpal.refunds.create({
            sessionId,
            amount,
            description,
            method: 'CARD',
            reason: 'CUSTOMER_REQUEST',
        });
        return refundResponse as RefundPaymentResponseAPI

        // const refundDetails = await zarinpal.refunds.retrieve(refundResponse.id);
        // console.log('Refund Details:', refundDetails);
    }

}

export default new ZarinpalService()