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
}

export default new ZarinpalService()