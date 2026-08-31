import { UserQueryBuilder } from "../../builders/userQuary.builder.js";
import bcrypt from 'bcrypt'
import roleRepository from "../../repository/role.repository.js";
import userRepository from "../../repository/user.repository.js";
import { RolesTitle } from "../../types/role.enum.js";
import { BadRequestError, ConflictError, ForbiddenError, InternalServerError, NotFoundError } from "../../utils/appError.js";
import { ChangeUserInfoDto, UserQSDto } from "../../validation/user.validation.js";
import authRepository from "../../repository/auth.repository.js";
import tokenService from "../token.service.js";
import { OrdersAdminDto } from "../../validation/order.validation.js";
import { OrderQueryBuilder } from "../../builders/orderQuary.builder.js";
import orderRepository from "../../repository/order.repository.js";
import User from "../../models/user.model.js";
import sequelize from "../../configs/sequelize.config.js";
import adminAuditLogRepository from "../../repository/adminAuditLog.repository.js";
import { AdminAuditAction, AdminAuditEntity } from "../../types/adminAuditLog.enum.js";
import { UserRole } from "../../models/role.model.js";

class AdminUserService {
    private HASHROUNDS = 12;

    async getAllUsers (qs : UserQSDto)
    : Promise<{
        rows: User[];
        count: number;
    }> {
        const options = UserQueryBuilder.build(qs)
        return await userRepository.getAllUsers(options)
    }

    async getUser (userId : number)
    : Promise<User> {
        // Get User
        const user = await userRepository.getUser(userId)
        if (!user)
            throw new NotFoundError(`User Not Found { ID : ${userId} }`)
        return user
    }

    async changeUserInfo (userId : number, userData : ChangeUserInfoDto, adminId : number)
    : Promise<ChangeUserInfoDto> {
        // Get User
        const user = await authRepository.getUserById(userId)
        if (!user)
            throw new NotFoundError(`User Not Found { ID : ${userId} }`)

        // Create Data
        const data: Partial<Pick<User, "name" | "phone">> = {}

        if (userData.name !== undefined && userData.name !== user.name)
            data.name = userData.name

        if (userData.phone !== undefined && userData.phone !== user.phone)
            data.phone = userData.phone

        await sequelize.transaction(async t => {
            // Change User
            if (!(await userRepository.changeUserInfo(userId, data, t)))
                throw new NotFoundError(`User Not Found { ID : ${userId} }`)

            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.UPDATE,
                entityType : AdminAuditEntity.USER,
                entityId : userId,
                ipAddress : null,
                reason : null,
                oldValues : {
                    name : user.name,
                    phone : user.phone
                },
                newValues : data
            }, t)
        })
        
        return data
    }

    async changeUserEmail (userId : number, adminId : number, email : string)
    : Promise<void> {
        // Get Admin
        const admin = await userRepository.userById(adminId)
        if (!admin)
            throw new NotFoundError(`Admin Not Found { ID : ${adminId} }`)

        const isOwner = admin.roles?.some(userRole => userRole.role?.name === RolesTitle.OWNER) ?? false
        if (!isOwner)
            throw new ForbiddenError('Not Access')
        // Get User
        const user = await authRepository.getUserById(userId)
        if (!user)
            throw new NotFoundError(`User Not Found { ID : ${userId} }`)

        await sequelize.transaction(async t => {
            // Change User Email
            if (!(await userRepository.changeUserEmail(userId, email, t)))
                throw new ConflictError(`User Email Not Changed`)

            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.EMAIL_CHANGE,
                entityType : AdminAuditEntity.USER,
                entityId : userId,
                ipAddress : null,
                reason : null,
                oldValues : {
                    email : user.email
                },
                newValues : {
                    email
                }
            }, t)
        })
        
        return
    }

    async changeUserStatus (userId : number, adminId : number, reason : string)
    : Promise<boolean> {
        // Check IDs
        if (userId === adminId)
            throw new ForbiddenError('You Can Not Change Yourself Status')

        // Get User
        const user = await userRepository.userById(userId)
        if (!user)
            throw new NotFoundError(`User Not Found { ID : ${userId} }`)
        
        // Check User Role
        const userRoles = user.roles!
        if (user.roles?.some(userRole => userRole.role?.name === RolesTitle.OWNER))
            throw new ForbiddenError('Can Not Change Owner Status')

        await sequelize.transaction(async t => {
            // Change Status
            if (!(await userRepository.changeUserStatus(userId, user.isActive, t)))
                throw new ConflictError('User Status Not Changed')

            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : user.isActive ? AdminAuditAction.DEACTIVATE : AdminAuditAction.ACTIVATE,
                entityType : AdminAuditEntity.USER,
                entityId : userId,
                ipAddress : null,
                oldValues : null,
                newValues : null,
                reason
            }, t)
        })
        
        return !user.isActive
    }

    async adminResetUserPassword (userId : number, adminId : number, password : string, reason : string)
    : Promise<void> {
        // Get Admin & Check isOwner
        const admin = await userRepository.getUser(adminId)
        if (!admin)
            throw new NotFoundError(`Admin Not Found { ID : ${adminId} }`)

        const isOwner = admin.roles?.some(userRole => userRole.role?.name === RolesTitle.OWNER) ?? false
        if (!isOwner)
            throw new ForbiddenError('Not Access')
        // Get User
        const user = await authRepository.getUserById(userId)
        if (!user)
            throw new NotFoundError(`User Not Found { ID : ${userId} }`)

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, this.HASHROUNDS)

        await sequelize.transaction(async t => {
            // Change Password
            if (await authRepository.changeUserPassword(userId, hashedPassword, t))
                throw new ConflictError('Password Not Changed')

            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.PASSWORD_CHANGE,
                entityType : AdminAuditEntity.USER,
                entityId : userId,
                ipAddress : null,
                oldValues : null,
                newValues : null,
                reason
            }, t)
        })
        
        // Remove Refresh Token
        await tokenService.revokeRefreshToken(userId)
        return
    }

    async adminChangeVerifiedUserEmail (userId : number, adminId : number)
    : Promise<boolean> {
        // Get User
        const user = await authRepository.getUserById(userId)
        if (!user)
            throw new NotFoundError(`User Not Found { ID : ${userId} }`)

        const currentStatus = user.isEmailVerified
        await sequelize.transaction(async t => {
            // Change Status
            if (!(await userRepository.changeVerifiedEmailStatus(userId, currentStatus, t)))
                throw new ConflictError('Email Verified Status Not Changed')

            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.VERIFY,
                entityType : AdminAuditEntity.USER,
                entityId : userId,
                ipAddress : null,
                reason : null,
                oldValues : {
                    isEmailVerified : currentStatus
                },
                newValues : {
                    isEmailVerified : !currentStatus
                }
            }, t)
        })
        
        return !currentStatus
    }

    async revokeUserSessions (userId : number)
    : Promise<void> {
        await tokenService.revokeRefreshToken(userId)
        return
    }

    // User - Role
    async getUserRoles (userId : number)
    : Promise<UserRole[]> {
        // Get User
        const user = await authRepository.getUserById(userId)
        if (!user)
            throw new NotFoundError(`User Not Found { ID : ${userId} }`)

        // Get Roles 
        return await roleRepository.getUserRoles(userId)
    }

    async addRoleToUser (userId : number, roleId : number, adminId : number)
    : Promise<UserRole> {
        // Get User
        const user = await authRepository.getUserById(userId)
        if (!user)
            throw new NotFoundError(`User Not Found { ID : ${userId} }`)

        // Get Admin
        const admin = await authRepository.getUserById(adminId)
        if (!admin)
            throw new NotFoundError(`Admin Not Found { ID : ${adminId} }`)

        const isOwner = admin.roles?.some(userRole => userRole.role?.name === RolesTitle.OWNER ) ?? false
        // Get Role
        const role = await roleRepository.getRoleById(roleId)
        if (!role)
            throw new NotFoundError(`Role Not Found { ID : ${roleId} }`)

        // Check Role
        const existsRole = user.roles?.some(userRole => userRole.roleId === roleId) ?? false
        if (existsRole)
            throw new ConflictError('User Already Has This Role')

        if (role.name === RolesTitle.OWNER)
            throw new ForbiddenError('Owner Role Can Not Be Assigned')

        if (userId === adminId && !isOwner)
            throw new ForbiddenError('You Can Not Change Your Own Roles')

        if (role.name === RolesTitle.ADMIN && !isOwner)
                throw new ForbiddenError('Not Access')
        
        const addedRole = await sequelize.transaction(async t => {
            // Add Role To User
            const addedRole = await roleRepository.setUserRole(userId, roleId, t)

            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.ROLE_ASSIGN,
                entityType : AdminAuditEntity.ROLE,
                entityId : roleId,
                ipAddress : null,
                reason : null,
                oldValues : null,
                newValues : {
                    userId,
                    roleId,
                }
            }, t)

            return addedRole
        })
        
        return addedRole
    }

    async deleteUserRole (userId : number, roleId : number, adminId : number)
    : Promise<void> {
        // Get User
        const user = await authRepository.getUserById(userId)
        if (!user)
            throw new NotFoundError(`User Not Found { ID : ${userId} }`)

        // Get Admin
        const admin = await authRepository.getUserById(adminId)
        if (!admin)
            throw new NotFoundError(`Admin Not Found { ID : ${adminId} }`)

        const isOwner = admin.roles?.some(userRole => userRole.role?.name === RolesTitle.OWNER ) ?? false

        // Get Role
        const role = await roleRepository.getRoleById(roleId)
        if (!role)
            throw new NotFoundError(`Role Not Found { ID : ${roleId} }`)

        // Check Exists Role
        const existsRole = user.roles?.some(userRole => userRole.roleId === roleId) ?? false
        if (!existsRole)
            throw new BadRequestError('User Has Not This Role')

        // Check Role
        if (role.name === RolesTitle.OWNER)
            throw new ForbiddenError('Owner Role Can Not Be Removed')

        if (userId === adminId && !isOwner)
            throw new ForbiddenError('You Can Not Change Your Own Roles')

        if (role.name === RolesTitle.ADMIN && !isOwner)
                throw new ForbiddenError('Not Access')

        await sequelize.transaction(async t => {
            // Delete User Role
            if (await roleRepository.deleteUserRole(userId, roleId, t))
                throw new ConflictError('User Role Not Deleted')

            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.DELETE,
                entityType : AdminAuditEntity.ROLE,
                entityId : roleId,
                ipAddress : null,
                oldValues : {
                    userId,
                    roleId
                },
                newValues : null,
                reason : null
            }, t)
        })
        return
    }
}

export default new AdminUserService()