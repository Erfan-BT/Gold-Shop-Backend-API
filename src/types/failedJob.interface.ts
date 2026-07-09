import { Optional } from "sequelize";

export interface FailedJobAttributes {
    id : number;
    jobName : string;
    queue : string;
    payload : string;
    attempts : number;
    errorMessage : string;
    errorTrace : string | null;
    status : string;
    resolvedAt : Date;
    priority : number;
    isAutoRetry : boolean;
    failedAt : Date;
    updatedAt : Date;
}

export interface FailedJobCreationAttributes extends Optional<FailedJobAttributes,
    'id' | 'errorTrace' | 'resolvedAt' | 'isAutoRetry' | 'failedAt' | 'updatedAt'
> {}