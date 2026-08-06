export enum ShippingMethod {
    INPERSON = 'INPERSON',
    POST = 'POST',
    TIPAX = 'TIPAX'
}

export enum ShippingCost {
    INPERSON = 0,
    POST = 50000,
    TIPAX = 70000
}

export enum OrderStatus {
    PENDING_PAYMENT = 'PENDING_PAYMENT',
    PAID = 'PAID',
    CANCELED = 'CANCELED',
    REFUND_PENDING = 'REFUND_PENDING',
    REFUNDED = 'REFUNDED',
    PROCESSING = 'PROCESSING',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    COMPLETED = 'COMPLETED'
}

export enum OrderPaymentStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    FAILED = 'FAILED',
    REFUND_PENDING = 'REFUND_PENDING',
    REFUNDED = 'REFUNDED'
}

export enum OrderSort {
    NEWEST = 'NEWEST',
    OLDEST = 'OLDEST',
    PRICE_ASC = 'PRICE_ASC',
    PRICE_DESC = 'PRICE_DESC',
    DISCOUNT_ASC = 'DISCOUNT_ASC',
    DISCOUNT_DESC = 'DISCOUNT_DESC',
    TOTAL_ASC = "TOTAL_ASC",
    TOTAL_DESC = "TOTAL_DESC",
}