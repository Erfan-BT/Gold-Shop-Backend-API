import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import adminRoleService from "../../services/admin/role.admin.service.js";

class AdminRoleController {
    async getAllRoles (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const result = await adminRoleService.getAllRoles()

            res.status(200).json({
                success : true,
                msg : 'Roles',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new AdminRoleController()