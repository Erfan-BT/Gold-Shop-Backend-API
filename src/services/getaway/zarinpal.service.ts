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
}

export default new ZarinpalService()