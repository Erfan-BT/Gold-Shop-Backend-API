import { Optional } from "sequelize";

export interface RoleAttributes {
    id : number;
    name : string;
    createdAt : Date;
}

export interface RoleCreationAttributes extends Optional<RoleAttributes, 
    'id' | 'createdAt'
> {}

export interface UserRoleAttributes {
    id : number;
    userId : number;
    roleId : number;
}

export interface UserRoleCreationAttributes extends Optional<UserRoleAttributes,
    'id'
> {}