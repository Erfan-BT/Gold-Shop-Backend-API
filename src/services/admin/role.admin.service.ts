import roleRepository from "../../repository/role.repository.js"

class AdminRoleService {
    async getAllRoles ()
    {
        return await roleRepository.getRoles()
    }
}

export default new AdminRoleService()