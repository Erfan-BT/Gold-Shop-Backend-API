import { Model } from "sequelize"
import { Role, UserRole } from "../models/role.model.js"
import { RoleAttributes, UserRoleAttributes, UserRoleCreationAttributes } from "../types/role.interface.js"

class RoleRepository {
    async setUserRole (userId : number, roleId : number)
    : Promise<UserRoleAttributes> {
        return (await UserRole.create({userId, roleId})).toJSON()
    }
    async getUserRoles (userId : number)
    :  Promise<Model<UserRoleAttributes, UserRoleCreationAttributes>[]> {
        return await UserRole.findAll({
            where : {
                userId
            },
        })
    }
    async getRoleById (roleId : number) 
    : Promise<RoleAttributes | null> {
        return (await Role.findByPk(roleId))?.toJSON() ?? null
    }
    async getRolesName (userRoles : Model<UserRoleAttributes, UserRoleCreationAttributes>[])
    : Promise<string[]> {
        let rolesName : string[] = []
        userRoles.map(async userRole => {
            let userRoleJson : UserRoleAttributes = userRole.toJSON()
            let role = await this.getRoleById(userRoleJson.roleId)
            rolesName.push(role?.name ?? 'Unknown')
        })
        return rolesName
    }
}

export default new RoleRepository()