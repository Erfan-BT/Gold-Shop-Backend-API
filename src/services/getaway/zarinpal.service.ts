import { zarinpal } from "../../configs/zarinpal.config.js";

class ZarinpalService {
    async createPayment (amount : number, orderNumber : string) {
        const response = await zarinpal.payments.create({
            amount,
            callback_url : 'https://localhost:3000/api/orders/callback',
            description : `Payment For Order : ${orderNumber}`,
        })
        return response as {
            data: {
                authority : string,
                fee : number,
                fee_type : string,
                code : number,
                message : string
            },
            errors : any[]
        }
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
                msg : 'Payment Varified',
                data : response.data as {
                    code : number;
                    message : string;
                    ref_id : number;
                    card_pan : string;
                    card_hash : string;
                    fee_type : string;
                    fee : number;
                }
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
            data : inquiryResult.data as {
                code : number;
                message : string;
                status : string;
            }
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
        return refundResponse as {
            id : string;
            terminal_id : string;
            amount : number;
            timeline : any;
            refund_amount : number;
            refund_time : string;
            refund_status : string;
        }

        // const refundDetails = await zarinpal.refunds.retrieve(refundResponse.id);
        // console.log('Refund Details:', refundDetails);
    }

}

export default new ZarinpalService()