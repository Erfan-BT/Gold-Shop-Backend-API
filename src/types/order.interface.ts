import { Optional, OrderItem } from "sequelize";

// Order
export interface OrderAttributes {
    id : number;
    uuid : string;
    orderNumber : string;
    userId : number;
    altPhone : string;
    addressId : number;
    ipAddress : string;
    subtotal : number;
    discountAmount : number;
    shippingMethod : string;
    shippingCost : number;
    couponId : number | null;
    finalPrice : number;
    status : string;
    paymentStatus : string;
    shippedAt : Date | null;
    trackingCode : string | null;
    deliveredAt : Date |  null;
    createdAt : Date;
    deletedAt : Date | null;
}

export interface OrderCreationAttributes extends Optional<OrderAttributes,
    'id' | 'uuid' | 'shippedAt' | 'trackingCode' | 'deliveredAt' | 'createdAt' | 'deletedAt'
> {}

// Order Item
export interface OrderItemAttributes {
    id : number;
    orderId : number;
    variantId : number;
    quantity : number;
    unitPrice : number;
    finalPrice : number;
    goldPriceAtTime : number;
    deletedAt : Date | null;
}

export interface OrderItemCreationAttributes extends Optional<OrderItemAttributes,
    'id' | 'deletedAt'
> {}