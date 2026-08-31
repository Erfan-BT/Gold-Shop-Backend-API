import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import { ChangeUserInfoDto, ChangeUserRolesDto, UserIdDto, UserQSDto } from "../../validation/user.validation.js";
import adminUserService from "../../services/admin/user.admin.service.js";
import { EmailDto, PasswordDto } from "../../validation/auth.validation.js";
import { OrdersAdminDto } from "../../validation/order.validation.js";
import { AdminChangeUserPasswordDto, ReasonDto } from "../../validation/adminAudit.validation.js";

class AdminUserController {
    async getAllUsers (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const qs = req.validated.query as UserQSDto
            const result = await adminUserService.getAllUsers(qs)

            res.status(200).json({
                success : true,
                msg : 'All Users Successfully Found',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async getUser (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.validated.params as UserIdDto
            const result = await adminUserService.getUser(userId)

            res.status(200).json({
                success : true,
                msg : 'User Successfully Found',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async changeUserInfo (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.validated.params as UserIdDto
            const info = req.validated.body as ChangeUserInfoDto
            const adminId = req.user!.userId
            const result = await adminUserService.changeUserInfo(userId, info, adminId)

            res.status(200).json({
                success : true,
                msg : 'User Changed Successfully',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async changeUserEmail (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.validated.params as UserIdDto
            const adminId = req.user!.userId
            const { email } = req.validated.body as EmailDto
            await adminUserService.changeUserEmail(userId, adminId, email)

            res.status(200).json({
                success : true,
                msg : 'User Email Changed Successfully',
                data : {
                    email
                }
            })
        } catch (error) {
            next(error)
        }
    }

    async changeUserStatus (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.validated.params as UserIdDto
            const { reason } = req.validated.body as ReasonDto
            const adminId = req.user!.userId
            const result = await adminUserService.changeUserStatus(userId, adminId, reason)

            res.status(200).json({
                success : true,
                msg : 'User Status Changed Successfully',
                data : {
                    newStatus : result
                }
            })
        } catch (error) {
            next(error)
        }
    }

    async adminResetUserPassword (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.validated.params as UserIdDto
            const adminId = req.user!.userId
            const { reason, password } = req.validated.body as AdminChangeUserPasswordDto
            await adminUserService.adminResetUserPassword(userId, adminId, password, reason)

            res.status(200).json({
                success : true,
                msg : 'User Password Successfully Reseted',
                data : null
            })
        } catch (error) {
            next(error)
        }
    }

    async adminChangeVerifiedUserEmail (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.validated.params as UserIdDto
            const adminId = req.user!.userId
            const result = await adminUserService.adminChangeVerifiedUserEmail(userId, adminId)

            res.status(200).json({
                success : true,
                msg : 'Email Status Changed Successfully',
                data : {
                    newStatus : result
                }
            })
        } catch (error) {
            next(error)
        }
    }

    async revokeUserSessions (req : AuthRequest, res : Response, next : NextFunction)
    {
        try {
            const { userId } = req.validated.params as UserIdDto
            await adminUserService.revokeUserSessions(userId)

            res.status(200).json({
                success : true,
                msg : 'User Sessions Revoked Successfully',
                data : null
            })
        } catch (error) {
            next(error)
        }
    }

    // User - Role
    async getUserRoles (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.validated.params as UserIdDto
            const result = await adminUserService.getUserRoles(userId)

            res.status(200).json({
                success : true,
                msg : 'User Roles Successfully Found',
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
            const result = await adminUserService.addRoleToUser(userId, roleId, adminId)

            res.status(200).json({
                success : true,
                msg : 'Role Successfully Added To User',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async deleteUserRole (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId, roleId } = req.validated.params as ChangeUserRolesDto
            const adminId = req.user!.userId
            await adminUserService.deleteUserRole(userId, roleId, adminId)

            res.status(200).json({
                success : true,
                msg : 'User Role Successfully Deleted',
                data : null
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new AdminUserController()