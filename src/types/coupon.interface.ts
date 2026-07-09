import { Optional } from "sequelize";

export interface CouponAttributes {
    id : number;
    code : string;
    type : string;
    value : number;
    usageLimit : number;
    usedCount : number;
    expiresAt : Date;
    isActive : boolean;
    createdAt : Date;
    deletedAt : Date;
}

export interface CouponCreationAttributes extends Optional<CouponAttributes,
    'id' | 'createdAt' | 'deletedAt'
> {}