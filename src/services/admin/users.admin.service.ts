import { UserQueryBuilder } from "../../builders/userQuary.builder.js";
import userRepository from "../../repository/user.repository.js";
import { UserQSDto } from "../../validation/users.validation.js";

class AdminUsersService {
    async getAllUsers (qs : UserQSDto)
    {
        const options = UserQueryBuilder.build(qs)
        return await userRepository.getAllUsers(options)
    }
}

export default new AdminUsersService()