import { Optional } from "sequelize";

export interface SettingAttributes {
    id : number;
    key : string;
    value : string;
    type : string;
    group : string;
    isPublic : boolean;
    description : string;
    createdAt : Date;
}

export interface SettingCreationAttributes extends Optional<SettingAttributes,
    'id' | 'description' | 'createdAt'
> {}