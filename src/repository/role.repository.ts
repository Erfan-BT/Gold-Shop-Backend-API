import { UserRole } from "../models/role.model.js"
import { UserRoleAttributes } from "../types/role.interface.js"

class RoleRepository {
    async setUserRole (userId : number, roleId : number)
    : Promise<UserRoleAttributes> {
        return (await UserRole.create({userId, roleId})).toJSON()
    }
}

export default new RoleRepository()