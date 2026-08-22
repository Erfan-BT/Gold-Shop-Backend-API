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

export enum ReturnSort {
    NEWEST = 'NEWEST',
    OLDEST = 'OLDEST',
    REVIEWED_AT_ASC = 'REVIEWED_AT_ASC',
    REVIEWED_AT_DESC = 'REVIEWED_AT_DESC',
    REFUND_AMOUNT_ASC = 'REFUND_AMOUNT_ASC',
    REFUND_AMOUNT_DESC = 'REFUND_AMOUNT_DESC',
}

export type CreateReturnItemType = {
    returnRequestId : number;
    orderItemId : number;
    reason : string;
    description ?: string;
    quantity : number;
}