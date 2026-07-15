import { Request, Response, NextFunction } from 'express'
import { AppError, InternalServerError, UnauthorizedError } from '../utils/appError.js' 
import { logger } from '../configs/pino.config.js'
// import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

export function errorHandler(
    err : any,
    req : Request,
    res : Response,
    _next : NextFunction
) {
    if (!(err instanceof AppError)) {
        req.logger.error({ error : String(err) }, 'Unhandled Error')
        err = new InternalServerError(undefined, undefined, false)
    }
    // if (err instanceof JsonWebTokenError || err instanceof TokenExpiredError) {
    //     err = new UnauthorizedError("Token Is Invalid")
    // }
    req.logger.error({errorCode : err.statusCode, errorMsg : err.message, err}, "ERROR MIDDLEWARE")
    res.status(err.statusCode).json({
        success : false,
        msg : err.message,
        data : {}
    })
}