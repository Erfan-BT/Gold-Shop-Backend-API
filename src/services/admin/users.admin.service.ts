import { UserQueryBuilder } from "../../builders/userQuary.builder.js";
import userRepository from "../../repository/user.repository.js";
import { NotFoundError } from "../../utils/appError.js";
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
}

export default new AdminUsersService()