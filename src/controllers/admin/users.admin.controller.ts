import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import { ChangeUserInfoDto, ChangeUserRolesDto, UserIdDto, UserQSDto } from "../../validation/users.validation.js";
import adminUsersService from "../../services/admin/users.admin.service.js";
import { PasswordDto } from "../../validation/auth.validation.js";
import { OrdersAdminDto } from "../../validation/order.validation.js";

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

    async changeUserInfo (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.validated.params as UserIdDto
            const info = req.validated.body as ChangeUserInfoDto
            await adminUsersService.changeUserInfo(userId, info)

            res.status(200).json({
                success : true,
                msg : 'Change User Info',
                data : {}
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

    async adminResetUserPassword (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.validated.params as UserIdDto
            const adminId = req.user!.userId
            const { password } = req.validated.body as PasswordDto
            await adminUsersService.adminResetUserPassword(userId, adminId, password)

            res.status(200).json({
                success : true,
                msg : 'Admin Reset User Password',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

    async adminChangeVerifiedUserEmail (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.validated.params as UserIdDto
            const adminId = req.user!.userId
            const result = await adminUsersService.adminChangeVerifiedUserEmail(userId, adminId)

            res.status(200).json({
                success : true,
                msg : 'Admin Change Verified Email Status',
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
            await adminUsersService.revokeUserSessions(userId)

            res.status(200).json({
                success : true,
                msg : 'Revoke User Sessions',
                data : {}
            })
        } catch (error) {
            
        }
    }

    async getUserOrders (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.validated.params
            const qs = req.validated.query as OrdersAdminDto
            const result = await adminUsersService.getUserOrders(userId, qs)

            res.status(200).json({
                success : true,
                msg : 'User Orders',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    // User - Role
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

    async deleteUserRole (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId, roleId } = req.validated.params as ChangeUserRolesDto
            const adminId = req.user!.userId
            await adminUsersService.deleteUserRole(userId, roleId, adminId)

            res.status(200).json({
                success : true,
                msg : 'Delete User Role',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

    // Stats
    async stats (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const result = await adminUsersService.stats()

            res.status(200).json({
                success : true,
                msg : 'User Stats',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new AdminUsersController()