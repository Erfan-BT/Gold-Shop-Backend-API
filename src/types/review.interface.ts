import { Optional } from "sequelize";

export interface ReviewAttributes {
    id : number;
    userId : number;
    variantId : number;
    reating : number;
    comment : string;
    isApproved : boolean;
    isVerifiedPurchase : boolean;
    adminReplay : string;
    repliedAt : Date;
    createdAt : Date;
    deletedAt : Date;
}

export interface ReviewCreationAttributes extends Optional<ReviewAttributes,
    'id' | 'isApproved' | 'isVerifiedPurchase' | 'adminReplay' | 'repliedAt' | 'createdAt' | 'deletedAt'
> {}