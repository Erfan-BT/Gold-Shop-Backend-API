import { NextFunction, Request, Response } from "express";
import { ValidationSchemas } from "../types/validation.type.js";
import { ZodError } from "zod";
import { ValidationError } from "../utils/appError.js";


export function validate(schemas: ValidationSchemas) {
    return (req : Request, res: Response, next: NextFunction) => {
        try {
            if (schemas.body) req.body = schemas.body.parse(req.body);
            if (schemas.query) {
                Object.defineProperty(req, "query", {
                    value: schemas.query.parse(req.query),
                    writable: true,
                    configurable: true
                });
            }
            if (schemas.params) req.params = schemas.params.parse(req.params) as any
            next();
        } catch (error) {
            let errors : string[] = []
            if (error instanceof ZodError) {
                const errorsJson = JSON.parse(String(Array(error.message)[0]))
                errorsJson.map((error : any) => {
                    errors.push(`[${error.path}] : ${error.message}`)                    
                })
                throw new ValidationError(undefined, errors)
            }
            next(error)
        }
    }
}