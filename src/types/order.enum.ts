export enum ShippingMethod {
    INPERSON = 'inperson',
    POST = 'post',
    TIPAX = 'tipax'
}

export enum OrderStatus {
    PENDING_PAYMENT = 'pendingpayment',
    PAID = 'paid',
    CANCELED = 'canceled',
    REFUNDED = 'refunded',
    PROCESSING = 'processing',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered',
    COMPLETED = 'completed'
}

export enum OrderPaymentStatus {
    PENDING = 'pending',
    PAID = 'paid',
    FAILED = 'failed',
    REFUNDED = 'refunded'
}