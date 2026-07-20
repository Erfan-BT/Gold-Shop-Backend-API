import { CartItem } from "../models/cart.model.js";
import { ShippingMethod } from "./order.enum.js";

export type Pricing = {
    unitPrice: number;
    discount: {
        type: "fixed" | "percent";
        value: number;
    } | null;
    discountPerItem: number;
    finalPrice: number;
    subtotal: number;
    discountAmount: number;
    lineTotal: number;
}

export type CheckoutItem = {
    item : CartItem;
    pricing : Pricing;
}

export type CouponData = {
    couponId : number;
    couponCode : string;
    couponType : "fixed" | "percent";
    couponValue : number;
    couponDiscount : number;
} | null

export type CheckoutSession = {
    userId : number;
    cartId : number;

    items : {
        variantId : number;
        quantity : number;
        pricing : Pricing;
    }[];

    subtotal : number;
    productDiscount : number;
    couponData : CouponData | null;
    addressId : number;
    shippingMethod : ShippingMethod;
    shippingCost : number;
    total : number;

    goldPriceAtTime : number;
    createdAt: Date;
    expiresAt: Date;
}