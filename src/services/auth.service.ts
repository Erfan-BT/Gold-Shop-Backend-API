import authRepository from "../repository/auth.repository.js"
import { BadRequestError, ConflictError, InternalServerError, UnauthorizedError } from "../utils/appError.js"
import bcrypt from 'bcrypt'
import tokenService from "./token.service.js"
import roleRepository from "../repository/role.repository.js"
import userRepository from "../repository/user.repository.js"
import { emailQueue } from "../queue/email.queue.js"
import sequelize from "../configs/sequelize.config.js"
import { Roles } from "../types/role.enum.js"

class AuthService {
    private HASHROUNDS = 12;

    async register (name : string, email : string, phone : string, password : string) {
        // Check Exists Email
        const checkExistsUser = await authRepository.userByEmail(email)
        if (!checkExistsUser)
            throw new ConflictError('This Email Already Exists')
        // Hash Password
        const hashedPassword : string = await bcrypt.hash(password, this.HASHROUNDS)
        // Add User To DataBase && Set User Role
        const user = await sequelize.transaction(async (t) => {
            const user = await authRepository.register(name, email, phone, hashedPassword, t)
            await roleRepository.setUserRole(user.id, Roles.CUSTOMER, t)
            return user
        })
        
        // Token
        const tokens = await tokenService.generateTokens({
            userId : user.id,
            name,
            email
        })

        return {
            userId : user.id,
            name,
            email,
            tokens
        }
    }

    async login (email : string, password : string) {
        // Get User & Check Password
        const user = await authRepository.userByEmail(email, true)
        if (!user)
            throw new UnauthorizedError('Email Or Password Is Incorrect')
        const checkPassword : boolean = await bcrypt.compare(password, user.password)
        if (!checkPassword) {
            throw new UnauthorizedError('Email Or Password Is Incorrect')
        }
        // Token
        const tokens = await tokenService.generateTokens({
            userId : user!.id,
            name : user!.name,
            email
        })

        return {
            userId : user!.id,
            name : user!.name,
            email,
            tokens
        }
    }

    async logout (userId : number) {
        // Check Exists Token
        const refreshToken = await tokenService.getRefreshToken(userId)
        if (!refreshToken)
            throw new UnauthorizedError('Login First')
        // Remove Refresh Token
        await tokenService.revokeRefreshToken(userId)
    }

    async refresh (refreshToken : string) {
        // Create Access Token
        const accessToken = await tokenService.refreshAccessToken(refreshToken)
        if (!accessToken)
            throw new UnauthorizedError('Refresh Token Is Invalid Or Expired')
        return accessToken
    }

    async myAccount (userId : number) {
        // Get User
        const user = await userRepository.userById(userId)
        if (!user)
            throw new BadRequestError()
        return user
    }

    async verifyEmail (email : string) {
        // Get User
        const user = await authRepository.userByEmail(email)
        // Add Sending Email To Queue
        if (user && !user.isEmailVerified) {
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

    async verifyEmailConfirm (token : string) {
        // Verify Token
        const userId = await tokenService.verifyOTP('verify-email', token)
        // Get User
        const user = await userRepository.userById(userId)
        if (!user)
            throw new BadRequestError('OPT Token Data Is Invalid')
        // Check Email
        if (user.isEmailVerified)
            throw new ConflictError('Your Email Is Already Verified')
        // Set Email Verified
        const rows = await authRepository.verifyEmail(userId)
        if (rows === 0)
            throw new InternalServerError('Email Not Verified, Please Try Again Later')
        return
    }

    async forgetPassword (email : string) {
        // Get User
        const user = await authRepository.userByEmail(email)
        // // Add Sending Email To Queue
        if (user) {
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

    async resetPassword (token : string, password : string) {
        // Verify Token
        const userId = await tokenService.verifyOTP('forget-password', token)
        // Get User
        const user = await userRepository.userById(userId)
        if (!user)
            throw new BadRequestError('OPT Token Data Is Invalid')
        // Hash Password
        const hashedPassword : string = await bcrypt.hash(password, this.HASHROUNDS)
        // Update Password
        const rows = await authRepository.changeUserPassword(userId, hashedPassword)
        if (rows === 0)
            throw new InternalServerError('Password Not Changed, Please Try Again Later')
        // Remove Refresh Token
        await tokenService.revokeRefreshToken(userId)
    }

    async changePassword (userId : number, oldPassword : string, newPassword : string) {
        // Get User
        const user = await authRepository.userById(userId, true)
        if (!user)
            throw new BadRequestError()
        // Check Password
        const hashedOldPassword : string = user.password
        const checkPassword : boolean = await bcrypt.compare(oldPassword, hashedOldPassword)
        if (!checkPassword)
            throw new UnauthorizedError('The Old Password Is Incorrect')
        // Hash New Password
        const hashedNewPassword : string = await bcrypt.hash(newPassword, this.HASHROUNDS)
        // Update Password
        const rows = await authRepository.changeUserPassword(userId, hashedNewPassword)
        if (rows === 0)
            throw new InternalServerError('Password Not Changed, Please Try Again Later')
        // Remove Refresh Token
        await tokenService.revokeRefreshToken(userId)
    }
}

export default new AuthService()