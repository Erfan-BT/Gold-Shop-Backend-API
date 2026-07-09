import { Optional } from "sequelize";

// Return Request
export interface ReturnRequestAttributes {
    id : number;
    orderId : number;
    reason : string;
    description : string;
    status : string;
    reviewedBy : number | null;
    reviewedAt : Date | null;
    adminNote : string | null;
    refundAmount : number | null;
    refundStatus : string | null;
    trackingCode : string | null;
    resolvedAt : Date | null;
    createdAt : Date;
    updatedAt : Date | null;
    deletedAt : Date | null;
}

export interface ReturnRequestCreationAttributes extends Optional<ReturnRequestAttributes,
    'id' | 'reviewedBy' | 'reviewedAt' | 'adminNote' | 'refundAmount'
    | 'refundStatus' | 'trackingCode' | 'resolvedAt' | 'createdAt' | 'updatedAt' | 'deletedAt'
> {}

// Return Item
export interface ReturnItemAttributes {
    id : number;
    returnRequestId : number;
    orderItemId : number;
    quantity : number;
    refundAmount : number;
    createdAt : Date;
    deletedAt : Date | null;
}

export interface ReturnItemCreationAttributes extends Optional<ReturnItemAttributes,
    'id' | 'createdAt' | 'deletedAt'
> {}