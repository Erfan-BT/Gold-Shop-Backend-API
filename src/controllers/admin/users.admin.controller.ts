import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import { UserQSDto } from "../../validation/users.validation.js";
import adminUsersService from "../../services/admin/users.admin.service.js";

class AdminUsersController {
    async getAllUsers (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const qs = req.validated.query as UserQSDto
            const result = await adminUsersService.getAllUsers(qs)

            res.status(200).json({
                success : true,
                msg : 'All Users',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new AdminUsersController()