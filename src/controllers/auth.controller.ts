import { NextFunction, Request, Response } from "express";
import authService from "../services/auth.service.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

class AuthController {
    async register (req : Request, res : Response, next : NextFunction) {
        try {
            const { name , email , password , phone } = req.body
            const result = await authService.register(name, email, phone, password)
            res.status(201).json({
                success : true,
                msg : 'Register',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async login (req : Request, res : Response, next : NextFunction) {
        try {
            const { email, password } = req.body
            const result = await authService.login(email, password)
            res.status(200).json({
                success : true,
                msg : 'Login',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async logout (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const userId = req.user!.userId
            await authService.logout(userId)

            res.status(200).json({
                success : true,
                msg : 'LogOut',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

    async refresh (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { refreshToken } = req.body
            const result = await authService.refresh(refreshToken)
            
            res.status(200).json({
                success : false,
                msg : 'New Access Token',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new AuthController()