import { NextFunction, Request, Response } from "express";
import authService from "../services/auth.service.js";

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
}

export default new AuthController()