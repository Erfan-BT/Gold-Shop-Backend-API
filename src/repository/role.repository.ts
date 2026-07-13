import { Model, Transaction } from "sequelize"
import { Role, UserRole } from "../models/role.model.js"

class RoleRepository {
    async setUserRole (userId : number, roleId : number, transaction : Transaction | null)
    : Promise<UserRole> {
        return await UserRole.create({userId, roleId}, { transaction })
    }
    
    async getUserRoles (userId : number)
    : Promise<UserRole[]>
    {
        return await UserRole.findAll({
            where: {
                userId
            },
            include: [{
                model: Role,
                as: 'role'
            }]
        })
    }

    async getRoleById (roleId : number) 
    : Promise<Role | null> {
        return await Role.findByPk(roleId)
    }
}

export default new RoleRepository()