import { UserQueryBuilder } from "../../builders/userQuary.builder.js";
import { UserRole } from "../../models/role.model.js";
import roleRepository from "../../repository/role.repository.js";
import userRepository from "../../repository/user.repository.js";
import { RolesTitle } from "../../types/role.enum.js";
import { ConflictError, ForbiddenError, NotFoundError } from "../../utils/appError.js";
import { UserQSDto } from "../../validation/users.validation.js";

class AdminUsersService {
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
}

export default new AdminUsersService()