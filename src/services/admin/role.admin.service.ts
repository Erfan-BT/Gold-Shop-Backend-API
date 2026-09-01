import { Role } from "../../models/role.model.js"
import roleRepository from "../../repository/role.repository.js"

class AdminRoleService {
    async getAllRoles ()
    : Promise<Role[]> {
        return await roleRepository.getRoles()
    }
}

export default new AdminRoleService()