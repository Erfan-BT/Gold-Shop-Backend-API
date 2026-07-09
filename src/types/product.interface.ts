import { Optional } from "sequelize";

// Product
export interface ProductAttributes {
    id : number;
    title : string;
    slug : string;
    description : string;
    isActive : boolean;
    createdAt : Date;
    updatedAt : Date | null;
}

export interface ProductCreationAttributes extends Optional<ProductAttributes,
    'id' | 'createdAt' | 'updatedAt'
> {}

// Product Variant
export interface ProductVariantAttributes {
    id : number;
    productId : number;
    weight : number;
    karat : string;
    stoneType : string | null;
    color : string;
    sku : string;
    isActive : boolean;
    createdAt : Date;
}

export interface ProductVariantCreationAttributes extends Optional<ProductVariantAttributes,
    'id' | 'createdAt'
> {}

// Product Image
export interface ProductImageAttributes {
    id : number;
    variantId : number;
    imageUrl : string;
    altText : string;
    isPrimary : boolean;
    sortOrder : number;
    fileName : string;
    createdAt : Date;
}

export interface ProductImageCreationAttributes extends Optional<ProductImageAttributes,
    'id' | 'createdAt'
> {}

// Product Pricing
export interface ProductPricingAttributes {
    id : number;
    variantId : number;
    categoryId : number;
    wageType : string;
    wageValue : number;
    profitType : string;
    profitValue : number;
    taxPercent : number;
    priority : number;
    validFrom : Date;
    validTo : Date;
    isActive : boolean;
    createdAt : Date;
    updatedAt : Date | null;
}

export interface ProductPricingCreationAttributes extends Optional<ProductPricingAttributes,
    'id' | 'createdAt' | 'updatedAt'
> {}

// Product Discount
export interface ProductDiscountAttributes {
    id : number;
    variantId : number;
    type : string;
    value : string;
    startDate : Date;
    endDate : Date;
    isActive : boolean;
}

export interface ProductDiscountCreationAttributes extends Optional<ProductDiscountAttributes,
    'id'
> {}