import User from "../models/user.model.js"
import authRepository from "../repository/auth.repository.js"
import userRepository from "../repository/user.repository.js"
import { BadRequestError, InternalServerError, UnauthorizedError } from "../utils/appError.js"
import tokenService from "./token.service.js"
import bcrypt from 'bcrypt'

class UserService {
    async updateUser (userId : number, name : string, phone : string)
    : Promise<User> {
        // Get User
        const user = await userRepository.userById(userId)
        if (!user)
            throw new BadRequestError()
        // Update User
        await userRepository.updateUser(userId, name, phone)
        return (await userRepository.userById(userId)) as User
    }

    async deleteUser (userId : number, password : string)
    : Promise<void> {
        // Get User
        const user = await authRepository.userById(userId, true)
        if (!user)
            throw new BadRequestError()
        // Check Password
        const checkPassword : boolean = await bcrypt.compare(password, user.password)
        if (!checkPassword)
            throw new UnauthorizedError('Email Or Password Is Incorrect')
        // Soft Delete User
        const rows = await userRepository.deleteUser(userId)
        if (rows === 0)
            throw new InternalServerError('User Not Deleted, Please Try Again Later')
        // Remove Refresh Token
        await tokenService.revokeRefreshToken(userId)
    }
}

export default new UserService()