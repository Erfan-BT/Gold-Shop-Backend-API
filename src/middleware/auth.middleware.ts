import { Request, Response, NextFunction } from 'express'
import { logger } from '../configs/pino.config.js'
import { ForbiddenError, UnauthorizedError } from '../utils/appError.js'
import tokenService from '../services/token.service.js'
import userRepository from '../repository/user.repository.js'
import roleRepository from '../repository/role.repository.js'
import authRepository from '../repository/auth.repository.js'
import { UserRole } from '../models/role.model.js'

export interface AuthRequest extends Request {
    user ?: {
        userId : number;
        name : string;
        email : string;
        roles : UserRole[];
    }
}

export const notLoginMiddleware = async (
    req : AuthRequest,
    res : Response,
    next : NextFunction
) : Promise<void> => {
    try {
        // Get Auth Header
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer '))
            return next()

        // Get Token And Payload
        const token = authHeader.split(' ')[1]
        if (!token)
            return next()
        const payload = tokenService.verifyAccessToken(token)
        if (payload) {
            throw new ForbiddenError('You Are Already Logged In')
        }

        next()
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            return next()
        }
        next(error)
    }
}

export const authMiddleware = async (
    req : AuthRequest,
    res : Response,
    next : NextFunction
) : Promise<void> => {
    try {
        // Get Auth Header
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer '))
            throw new UnauthorizedError('The Token Is Invalid Or Expired')

        // Get Token And Payload
        const token : string = authHeader.split(' ')[1]!
        const payload = tokenService.verifyAccessToken(token)

        // User
        const user = await userRepository.userById(payload.userId)
        if (!user)
            throw new UnauthorizedError('User Not Found')

        if (!user.isActive) {
            throw new UnauthorizedError('User Is InActive')
        }

        // Get User Roles Name
        const roles = await roleRepository.getUserRoles(user.id)
        // Add User To Request
        req.user = {
            userId : user.id,
            name : user.name,
            email : user.email,
            roles
        }

        next()
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            next(error)
        } else {
            req.logger.error({ error }, 'Auth Middleware Error')
            next(new UnauthorizedError())
        }
    }
}

export const roleMiddleware = (allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const user = req.user
            if (!user)
                throw new UnauthorizedError('Login First')

            const hasRole = user.roles?.some((role) =>
                allowedRoles.includes(role.role?.name ?? 'NO')
            )

            if (!hasRole)
                throw new ForbiddenError('Not Access')

            next()
        } catch (error) {
            next(error)
        }
    }
}

export const emailVerifiedMiddleware = async (
    req : AuthRequest,
    res : Response,
    next : NextFunction
) => {
    try {
        const user = req.user
        if (!user)
            throw new UnauthorizedError('Login First')

        if (!(await authRepository.isEmailVerified(user.userId))) {
            throw new UnauthorizedError('Verify Your Email First')
        }
        next()
    } catch (error) {
        next(error)
    }
}