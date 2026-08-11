import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import { ChangeUserRolesDto, UserIdDto, UserQSDto } from "../../validation/users.validation.js";
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

    async getUser (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.validated.params as UserIdDto
            const result = await adminUsersService.getUser(userId)

            res.status(200).json({
                success : true,
                msg : 'User',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async changeUserStatus (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.validated.params as UserIdDto
            const adminId = req.user!.userId
            const result = await adminUsersService.changeUserStatus(userId, adminId)

            res.status(200).json({
                success : true,
                msg : 'Change User Status',
                data : {
                    newStatus : result
                }
            })
        } catch (error) {
            next(error)
        }
    }

    async getUserRoles (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.validated.params as UserIdDto
            const result = await adminUsersService.getUserRoles(userId)

            res.status(200).json({
                success : true,
                msg : 'User Roles',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async addRoleToUser (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId, roleId } = req.validated.params as ChangeUserRolesDto
            const adminId = req.user!.userId
            const result = await adminUsersService.addRoleToUser(userId, roleId, adminId)

            res.status(200).json({
                success : true,
                msg : 'Add Role To User',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new AdminUsersController()