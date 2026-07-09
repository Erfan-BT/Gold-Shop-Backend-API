import { Optional } from "sequelize";

export interface UserAttributes {
    id : number;
    name : string;
    email : string;
    password : string;
    phone : string;
    isEmailVerified : boolean;
    emailVerifiedAt : Date | null;
    isActive : boolean;
    createdAt : Date;
    updatedAt : Date | null;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 
    'id' |
    'isEmailVerified' |
    'emailVerifiedAt' |
    'isActive' |
    'createdAt' |
    'updatedAt'
> {}