export type PaymentData = {
    orderId : number;
    amount : number;
    transactionId : string;
    authorityCode : string;
    referenceCode : string;
    cardPan : string;
    ipAddress : string;
    bankResponse : string;
}

export type CreatePaymentResponseAPI = {
    data : {
        authority : string,
        fee : number,
        fee_type : string,
        code : number,
        message : string
    },
    errors : any[]
}

export type VerifyPaymentResponseAPI = {
    code : number;
    message : string;
    ref_id : number;
    card_pan : string;
    card_hash : string;
    fee_type : string;
    fee : number;
}

export type InquirePaymentResponseAPI = {
    code : number;
    message : string;
    status : string;
}

export type RefundPaymentResponseAPI = {
    id : string;
    terminal_id : string;
    amount : number;
    timeline : any;
    refund_amount : number;
    refund_time : string;
    refund_status : string;
}