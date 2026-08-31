import User from "../models/user.model.js"
import authRepository from "../repository/auth.repository.js"
import userRepository from "../repository/user.repository.js"
import { ConflictError, ForbiddenError, NotFoundError, UnauthorizedError } from "../utils/appError.js"
import { ChangeUserDto } from "../validation/user.validation.js"
import tokenService from "./token.service.js"
import bcrypt from 'bcrypt'

class UserService {
    async changeUser (userId : number, userData : ChangeUserDto)
    : Promise<ChangeUserDto> {
        // Get User
        const user = await authRepository.getUserById(userId)
        if (!user)
            throw new NotFoundError(`User Not Found { ID : ${userId} }`)

        if (!user.isActive)
            throw new ForbiddenError('This Account Has Been Deactivated')

        // Data
        const data : Partial<Pick<User, 'name' | 'phone'>> = {}

        if (userData.name !== undefined && userData.name !== user.name)
            data.name = userData.name

        if (userData.phone !== undefined && userData.phone !== user.phone)
            data.phone = userData.phone

        // Change User
        if(!(await userRepository.changeUser(userId, data)))
            throw new ConflictError('User Info Not Changed')

        return data
    }

    async deleteUser (userId : number, password : string)
    : Promise<void> {
        // Get User
        const user = await authRepository.getUserById(userId)
        if (!user)
            throw new NotFoundError(`User Not Found { ID : ${userId} }`)

        // Get Password
        const userPassword = await authRepository.getUserPasswordById(user.id)

        // Check Password
        const checkPassword : boolean = await bcrypt.compare(password, userPassword!.password)
        if (!checkPassword)
            throw new UnauthorizedError('Password Is Incorrect')

        // Soft Delete User
        if (!(await userRepository.deleteUser(userId)))
            throw new ConflictError('User Not Deleted')

        // Remove Refresh Token
        await tokenService.revokeRefreshToken(userId)
        return
    }
}

export default new UserService()