export type CartDTO = {
    totalItems : number;
    subtotal : number;
    discount : number;
    total : number;
    items : CartItemDTO[]
}

export type CartItemDTO = {
    variantId : number;
    title : string;
    slug : string;
    sku : string;
    quantity : number;
    stock : number;
    image : CartImageDTO | null;
    unitPrice : number;
    discount : CartDiscountDTO | null;
    finalPrice : number;
    lineTotal : number;
}

export type CartImageDTO = {
    imageUrl: string;
    altText: string;
    fileName: string;
}

export type CartDiscountDTO = {
    type: "fixed" | "percent";
    value: number;
}