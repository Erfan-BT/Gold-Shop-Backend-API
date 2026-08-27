import authRepository from "../repository/auth.repository.js"
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError, UnauthorizedError } from "../utils/appError.js"
import bcrypt from 'bcrypt'
import tokenService from "./token.service.js"
import roleRepository from "../repository/role.repository.js"
import userRepository from "../repository/user.repository.js"
import { emailQueue } from "../queue/email.queue.js"
import sequelize from "../configs/sequelize.config.js"
import { Roles } from "../types/role.enum.js"
import { RegisterDto } from "../validation/auth.validation.js"
import User from "../models/user.model.js"

class AuthService {
    private HASHROUNDS = 12;

    async register (registerData : RegisterDto)
    : Promise<{
        userId : number,
        name : string,
        email : string,
        phone : string,
        createdAt : Date,
        tokens : {
            accessToken : string,
            refreshToken : string
        }
    }> {
        // Check Exists User Email
        const existingUser  = await authRepository.getUserByEmail(registerData.email)
        if (existingUser )
            throw new ConflictError('This Email Already Exists')
        // Hash Password
        const hashedPassword : string = await bcrypt.hash(registerData.password, this.HASHROUNDS)
        // Add User To DataBase && Set User Role
        const user = await sequelize.transaction(async t => {
            const user = await authRepository.register(registerData.name, registerData.email, registerData.phone, hashedPassword, t)
            await roleRepository.setUserRole(user.id, Roles.CUSTOMER, t)
            return user
        })
        
        // Token
        const tokens = await tokenService.generateTokens({
            userId : user.id,
            name : registerData.name,
            email : registerData.email
        })

        return {
            userId : user.id,
            name : user.name,
            email : user.email,
            phone : user.phone,
            createdAt : user.createdAt,
            tokens
        }
    }

    async login (email : string, password : string)
    : Promise<{
        userId : number,
        name : string,
        email : string,
        tokens: {
            accessToken: string;
            refreshToken: string;
        }
    }> {
        // Get User
        const user = await authRepository.getUserByEmail(email)
        if (!user)
            throw new UnauthorizedError('Email Or Password Is Incorrect')
        if (!user.isActive)
            throw new ForbiddenError('This Account Has Been Deactivated')

        // Get User Password & Check Password
        const userByPassword = await authRepository.getUserPasswordById(user.id)
        const checkPassword : boolean = await bcrypt.compare(password, userByPassword!.password)

        if (!checkPassword)
            throw new UnauthorizedError('Email Or Password Is Incorrect')

        // Token
        const tokens = await tokenService.generateTokens({
            userId : user.id,
            name : user.name,
            email
        })

        return {
            userId : user.id,
            name : user.name,
            email,
            tokens
        }
    }

    async logout (userId : number)
    : Promise<void> {
        // Check Exists Token
        const refreshToken = await tokenService.getRefreshToken(userId)
        if (!refreshToken)
            throw new UnauthorizedError('Login First')
        // Remove Refresh Token
        await tokenService.revokeRefreshToken(userId)
        return
    }

    async refresh (refreshToken : string)
    : Promise<{ accessToken : string }> {
        // Create Access Token
        const accessToken = await tokenService.refreshAccessToken(refreshToken)
        if (!accessToken)
            throw new UnauthorizedError('Refresh Token Is Invalid Or Expired')
        return {
            accessToken
        }
    }

    async myAccount (userId : number)
    : Promise<User> {
        // Get User
        const user = await userRepository.userById(userId)
        if (!user)
            throw new NotFoundError(`User Not Found { ID : ${userId} }`)

        if (!user.isActive)
            throw new ForbiddenError('This Account Has Been Deactivated')

        return user
    }

    async verifyEmail (email : string)
    : Promise<void> {
        // Get User
        const user = await authRepository.getUserByEmail(email)

        // Add Sending Email To Queue
        if (user && user.isActive && !user.isEmailVerified) {
            await emailQueue.add('send-verify-email',
                {
                    userId : user.id,
                    name : user.name,
                    email
                }
            )
        }
        return
    }

    async verifyEmailConfirm (token : string)
    : Promise<void> {
        // Verify Token
        const userId = await tokenService.verifyOTP('verify-email', token)

        // Get User
        const user = await authRepository.getUserById(userId)
        if (!user)
            throw new BadRequestError('OPT Token Data Is Invalid')

        if (!user.isActive)
            throw new ForbiddenError('This Account Has Been Deactivated')

        // Check Email
        if (user.isEmailVerified)
            throw new ConflictError('Your Email Is Already Verified')

        // Set Email Verified
        if (!(await authRepository.verifyEmail(userId)))
            throw new ConflictError('Email Not Verified')

        return
    }

    async forgetPassword (email : string)
    : Promise<void> {
        // Get User
        const user = await authRepository.getUserByEmail(email)
        // Add Sending Email To Queue
        if (user && user.isActive) {
            await emailQueue.add('send-forgetPassword-email',
                {
                    userId : user.id,
                    name : user.name,
                    email
                }
            )
        }
        return
    }

    async resetPassword (token : string, password : string)
    : Promise<void> {
        // Verify Token
        const userId = await tokenService.verifyOTP('forget-password', token)

        // Get User
        const user = await authRepository.getUserById(userId)
        if (!user)
            throw new BadRequestError('OPT Token Data Is Invalid')
        
        if (!user.isActive)
            throw new ForbiddenError('This Account Has Been Deactivated')

        // Hash Password
        const hashedPassword : string = await bcrypt.hash(password, this.HASHROUNDS)

        // Change Password
        if (!(await authRepository.changeUserPassword(userId, hashedPassword)))
            throw new ConflictError('Password Not Changed')

        // Remove Refresh Token
        await tokenService.revokeRefreshToken(userId)
        return
    }

    async changePassword (userId : number, oldPassword : string, newPassword : string)
    : Promise<void> {
        // Get User
        const user = await authRepository.getUserById(userId)
        if (!user)
            throw new NotFoundError(`User Not Found { ID : ${userId} }`)

        if (!user.isActive)
            throw new ForbiddenError('This Account Has Been Deactivated')

        // Get Password
        const userPassword = await authRepository.getUserPasswordById(user.id)
        // Check Password
        const hashedOldPassword : string = userPassword!.password
        const checkPassword : boolean = await bcrypt.compare(oldPassword, hashedOldPassword)
        if (!checkPassword)
            throw new UnauthorizedError('The Old Password Is Incorrect')

        // Hash New Password
        const hashedNewPassword : string = await bcrypt.hash(newPassword, this.HASHROUNDS)

        // Change Password
        if (!(await authRepository.changeUserPassword(userId, hashedNewPassword)))
            throw new ConflictError('Password Not Changed')

        // Remove Refresh Token
        await tokenService.revokeRefreshToken(userId)
        return
    }
}

export default new AuthService()