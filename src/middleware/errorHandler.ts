import { Request, Response, NextFunction } from 'express'
import { AppError, InternalServerError } from '../utils/appError.js' 
import { logger } from '../configs/pino.config.js'

export function errorHandler(
    err : any,
    req : Request,
    res : Response,
    next : NextFunction
) {
    if (!(err instanceof AppError)) {
        err = new InternalServerError(String(err))
    }
    logger.error(`[${err.statusCode}] =>  ${err.message}`)
    res.status(err.statusCode).json({
        success : false,
        msg : err.message,
        data : err
    })
}