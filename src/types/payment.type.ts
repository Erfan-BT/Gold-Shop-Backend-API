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