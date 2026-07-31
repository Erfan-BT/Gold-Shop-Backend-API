export enum ReturnStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    CANCELED = 'CANCELED',
}

export enum RefundStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    CANCELED = 'CANCELED',
}

export type CreateReturnItemType = {
    returnRequestId : number;
    orderItemId : number;
    reason : string;
    description ?: string;
    quantity : number;
}