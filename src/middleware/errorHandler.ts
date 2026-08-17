import { Request, Response, NextFunction } from 'express'
import { AppError, BadRequestError, InternalServerError, UnauthorizedError } from '../utils/appError.js' 
import { logger } from '../configs/pino.config.js'
import multer from 'multer'
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
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE')
            err = new BadRequestError('Image File Is Too Large')

        if (err.code === 'LIMIT_FILE_COUNT')
            err = new BadRequestError('Too Many Images')
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