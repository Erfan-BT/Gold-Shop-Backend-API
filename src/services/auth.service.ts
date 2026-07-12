import authRepository from "../repository/auth.repository.js"
import { BadRequestError, ConflictError, InternalServerError, UnauthorizedError } from "../utils/appError.js"
import bcrypt from 'bcrypt'
import tokenService from "./token.service.js"
import roleRepository from "../repository/role.repository.js"
import userRepository from "../repository/user.repository.js"
import { emailQueue } from "../queue/email.queue.js"

class AuthService {
    async register (name : string, email : string, phone : string, password : string) {
        // Check Exists Email
        const existsEmail : boolean = await authRepository.existsEmail(email)
        if (existsEmail)
            throw new ConflictError('This Email Already Exists')
        // Hash Password
        const hashedPassword : string = await bcrypt.hash(password, 12)
        // Add User To DataBase
        const user = await authRepository.register(name, email, phone, hashedPassword)
        // Set User Role
        const setRole = await roleRepository.setUserRole(user.id, 3)
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
        // Check Exists Email
        const existsEmail : boolean = await authRepository.existsEmail(email)
        if (!existsEmail)
            throw new UnauthorizedError('Email Or Password Is Incorrect')
        // Get User Password & Check Password
        const hashedPassword : string = await authRepository.userPassword(email)
        const checkPassword : boolean = await bcrypt.compare(password, hashedPassword)
        if (!checkPassword) {
            throw new UnauthorizedError('Email Or Password Is Incorrect')
        }
            
        // Get User
        const user = await authRepository.userByEmail(email)
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
        // Check Exists User
        const user = await userRepository.userById(userId)
        if (!user)
            throw new UnauthorizedError('Login First')
        // Check Exists Token
        const refreshToken = await tokenService.getRefreshToken(userId)
        if (!refreshToken)
            throw new UnauthorizedError('Login First')
        // Delete Token
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
        const hashedPassword : string = await bcrypt.hash(password, 12)
        // Update Password
        const rows = await authRepository.chnageUserPassword(userId, hashedPassword)
        if (rows === 0)
            throw new InternalServerError('Password Not Changed, Please Try Again Later')
    }
}

export default new AuthService()