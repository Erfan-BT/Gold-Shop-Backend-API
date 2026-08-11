import { Model, Transaction } from "sequelize"
import { Role, UserRole } from "../models/role.model.js"

class RoleRepository {
    async setUserRole (userId : number, roleId : number, transaction : Transaction | null)
    : Promise<UserRole> {
        return await UserRole.create({userId, roleId}, { transaction })
    }

    async deleteUserRole (userId : number, roleId : number, transaction : Transaction | null)
    : Promise<boolean> {
        const rows = await UserRole.destroy({
            where : {
                userId,
                roleId
            },
            transaction
        })
        return rows === 1
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
                as: 'role',
                attributes : ['id', 'name']
            }],
            attributes : ['id']
        })
    }

    async getRoleById (roleId : number) 
    : Promise<Role | null> {
        return await Role.findByPk(roleId)
    }

}

export default new RoleRepository()