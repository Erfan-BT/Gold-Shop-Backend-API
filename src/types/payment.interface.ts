import { Optional } from "sequelize";

export interface PaymentAttributes {
    id : number;
    uuid : number;
    orderId : number;
    amount : number;
    treansactionId : string;
    authorityCode : string;
    refernceCode : string;
    cardPan : string;
    status : string;
    ipAddress : string;
    refundAmount : number;
    refundReason : string;
    refundId : string;
    bankResponse : string;
    paidAt : Date;
    refundedAt : Date;
    updatedAt : Date;
    deletedAt : Date
}

export interface PaymentCreationAttributes extends Optional<PaymentAttributes,
    'id' | 'uuid' | 'refundAmount' | 'refundReason' | 'refundId' | 'refundedAt' | 'paidAt' | 'updatedAt' | 'deletedAt'
> {}