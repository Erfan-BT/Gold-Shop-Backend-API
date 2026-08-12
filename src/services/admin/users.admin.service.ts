import { UserQueryBuilder } from "../../builders/userQuary.builder.js";
import bcrypt from 'bcrypt'
import roleRepository from "../../repository/role.repository.js";
import userRepository from "../../repository/user.repository.js";
import { RolesTitle } from "../../types/role.enum.js";
import { ConflictError, ForbiddenError, InternalServerError, NotFoundError } from "../../utils/appError.js";
import { ChangeUserInfoDto, UserQSDto } from "../../validation/users.validation.js";
import authRepository from "../../repository/auth.repository.js";
import tokenService from "../token.service.js";
import { OrdersAdminDto } from "../../validation/order.validation.js";
import { OrderQueryBuilder } from "../../builders/orderQuary.builder.js";
import orderRepository from "../../repository/order.repository.js";
import User from "../../models/user.model.js";

class AdminUsersService {
    private HASHROUNDS = 12;

    async getAllUsers (qs : UserQSDto)
    {
        const options = UserQueryBuilder.build(qs)
        return await userRepository.getAllUsers(options)
    }

    async getUser (userId : number)
    {
        const user = await userRepository.getUser(userId)
        if (!user)
            throw new NotFoundError(`User Not Found { ID : ${userId} }`)
        return user
    }

    async changeUserInfo (userId : number, info : ChangeUserInfoDto)
    {
        const data: Partial<Pick<User, "name" | "phone">> = {};
        if (info.name !== undefined)
            data.name = info.name

        if (info.phone !== undefined)
            data.phone = info.phone

        if (!(await userRepository.changeUserInfo(userId, data)))
            throw new NotFoundError(`User Not Found { ID : ${userId} }`)
        return
    }

    async changeUserEmail (userId : number, adminId : number, email : string)
    {
        // Get Admin
        const admin = await userRepository.userById(adminId)
        if (!admin)
            throw new NotFoundError(`Admin Not Found { ID : ${adminId} }`)
        const isOwner = admin.roles?.some(userRole => userRole.role?.name === RolesTitle.OWNER) ?? false
        if (!isOwner)
            throw new ForbiddenError('Not Access')
        // Change Email
        if (!(await userRepository.changeUserEmail(userId, email)))
            throw new NotFoundError(`User Not Found { ID : ${userId} }`)
        return
    }

    async changeUserStatus (userId : number, adminId : number)
    {
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
        // Change Status
        if (!(await userRepository.changeUserStatus(userId, user.isActive)))
            throw new ConflictError('User Status Not Changed')
        return !user.isActive
    }

    async adminResetUserPassword (userId : number, adminId : number, password : string)
    {
        // Get Admin & Check isOwner
        const admin = await userRepository.getUser(adminId)
        if (!admin)
            throw new NotFoundError(`Admin Not Found { ID : ${adminId} }`)
        const isOwner = admin.roles?.some(userRole => userRole.role?.name === RolesTitle.OWNER) ?? false
        if (!isOwner)
            throw new ForbiddenError('Not Access')
        // Get User
        const user = await userRepository.getUser(userId)
        if (!user)
            throw new NotFoundError(`User Not Found { ID : ${userId} }`)
        // Hash Password
        const hashedPassword = await bcrypt.hash(password, this.HASHROUNDS)
        // Update Password
        const rows = await authRepository.changeUserPassword(userId, hashedPassword)
        if (rows === 0)
            throw new InternalServerError('Password Not Changed, Please Try Again Later')
        // Remove Refresh Token
        await tokenService.revokeRefreshToken(userId)
        return
    }

    async adminChangeVerifiedUserEmail (userId : number, adminId : number)
    {
        // Get Admin
        const admin = await userRepository.getUser(adminId)
        if (!admin)
            throw new NotFoundError(`Admin Not Found { ID : ${adminId} }`)
        // Get User
        const user = await userRepository.getUser(userId)
        if (!user)
            throw new NotFoundError(`User Not Found { ID : ${userId} }`)
        // Change Status
        const currentStatus = user.isEmailVerified
        if (!(await userRepository.changeVerifiedEmailStatus(userId, currentStatus)))
            throw new InternalServerError('Email Verified Status Not Changed')
        return !currentStatus
    }

    async revokeUserSessions (userId : number)
    {
        await tokenService.revokeRefreshToken(userId)
        return
    }

    async getUserOrders (userId : number, qs : OrdersAdminDto)
    {
        // Get User
        const user = await userRepository.userById(userId)
        if (!user)
            throw new NotFoundError(`User Not Found { ID : ${userId} }`)
        // Build Options
        const options = OrderQueryBuilder.build(qs, userId)
        return await orderRepository.getOrders(options)
    }

    // User - Role
    async getUserRoles (userId : number)
    {
        // Get User
        const user = await userRepository.userById(userId)
        if (!user)
            throw new NotFoundError(`User Not Found { ID : ${userId} }`)
        return await roleRepository.getUserRoles(userId)
    }

    async addRoleToUser (userId : number, roleId : number, adminId : number)
    {
        // Get User
        const user = await userRepository.userById(userId)
        if (!user)
            throw new NotFoundError(`User Not Found { ID : ${userId} }`)
        // Get Admin
        const admin = await userRepository.userById(adminId)
        if (!admin)
            throw new NotFoundError(`Admin Not Found { ID : ${adminId} }`)
        const isOwner = admin.roles?.some(userRole => userRole.role?.name === RolesTitle.OWNER ) ?? false
        // Get Role
        const role = await roleRepository.getRoleById(roleId)
        if (!role)
            throw new NotFoundError('Role Not Found')
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
        // Add Role To User
        const addedRole = await roleRepository.setUserRole(userId, roleId, null)
        return addedRole
    }

    async deleteUserRole (userId : number, roleId : number, adminId : number)
    {
        // Get User
        const user = await userRepository.userById(userId)
        if (!user)
            throw new NotFoundError(`User Not Found { ID : ${userId} }`)
        // Get Admin
        const admin = await userRepository.userById(adminId)
        if (!admin)
            throw new NotFoundError(`Admin Not Found { ID : ${adminId} }`)
        const isOwner = admin.roles?.some(userRole => userRole.role?.name === RolesTitle.OWNER ) ?? false
        // Get Role
        const role = await roleRepository.getRoleById(roleId)
        if (!role)
            throw new NotFoundError('Role Not Found')
        // Check Exists Role
        const existsRole = user.roles?.some(userRole => userRole.roleId === roleId) ?? false
        if (!existsRole)
            throw new ConflictError('User Has Not This Role')
        // Check Role
        if (role.name === RolesTitle.OWNER)
            throw new ForbiddenError('Owner Role Can Not Be Removed')
        if (userId === adminId && !isOwner)
            throw new ForbiddenError('You Can Not Change Your Own Roles')
        if (role.name === RolesTitle.ADMIN && !isOwner)
                throw new ForbiddenError('Not Access')
        // Delete User Role
        const isDelete = await roleRepository.deleteUserRole(userId, roleId, null)
        if (!isDelete)
            throw new InternalServerError('User Role Not Deleted')
        return
    }

    // Stats
    async stats ()
    {
        return await userRepository.statsMain()
    }
}

export default new AdminUsersService()