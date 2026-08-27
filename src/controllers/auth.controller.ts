import { NextFunction, Request, Response } from "express";
import authService from "../services/auth.service.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { changePasswordDto, EmailDto, LoginDto, OptDto, PasswordDto, RefreshDto, RegisterDto } from "../validation/auth.validation.js";

class AuthController {
    async register (req : Request, res : Response, next : NextFunction) {
        try {
            const registerData = req.validated.body as RegisterDto
            const result = await authService.register(registerData)

            res.status(201).json({
                success : true,
                msg : 'Registration Successful',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async login (req : Request, res : Response, next : NextFunction) {
        try {
            const { email, password } = req.validated.body as LoginDto
            const result = await authService.login(email, password)

            res.status(200).json({
                success : true,
                msg : 'Login Successful',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async logout (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
            await authService.logout(userId)

            res.status(200).json({
                success : true,
                msg : 'Logout Successful',
                data : null
            })
        } catch (error) {
            next(error)
        }
    }

    async refresh (req : Request, res : Response, next : NextFunction) {
        try {
            const { refreshToken } = req.validated.body as RefreshDto
            const result = await authService.refresh(refreshToken)
            
            res.status(200).json({
                success : true,
                msg : 'New Access Token Created',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async myAccount (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
            const result = await authService.myAccount(userId)

            res.status(200).json({
                success : true,
                msg : 'User Account Found Successfully',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async verifyEmail (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { email } = req.user!
            await authService.verifyEmail(email)

            res.status(200).json({
                success : true,
                msg : 'If The Email Exists, A Verification Email Has Been Sent',
                data : null
            })
        } catch (error) {
            next(error)
        }
    }

    async verifyEmailConfirm (req : Request, res : Response, next : NextFunction) {
        try {
            const { token } = req.validated.params as OptDto
            await authService.verifyEmailConfirm(token)

            res.status(200).json({
                success : true,
                msg : 'Email Successfully Verified',
                data : null
            })
        } catch (error) {
            next(error)
        }
    }

    async forgetPassword (req : Request, res : Response, next : NextFunction) {
        try {
            const { email } = req.validated.body as EmailDto
            await authService.forgetPassword(email)

            res.status(200).json({
                success : true,
                msg : 'If The Email Exists, A Verification Email Has Been Sent',
                data : null
            })
        } catch (error) {
            next(error)
        }
    }

    async resetPassword (req : Request, res : Response, next : NextFunction) {
        try {
            const { token } = req.validated.params as OptDto
            const { password } = req.validated.body as PasswordDto
            await authService.resetPassword(token , password)

            res.status(200).json({
                success : true,
                msg : 'Password Reset Successfully',
                data : null
            })
        } catch (error) {
            next(error)
        }
    }

    async changePassword (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
            const { oldPassword , newPassword } = req.validated.body as changePasswordDto
            await authService.changePassword(userId, oldPassword, newPassword)

            res.status(200).json({
                success : true,
                msg : 'Change Password Succesfully',
                data : null
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new AuthController()