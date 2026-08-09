import { FindAndCountOptions } from "sequelize"
import Address from "../models/address.model.js"
import User from "../models/user.model.js"

class UserRepository {
    async userById (userId : number)
    : Promise<User | null> {
        return await User.findByPk(userId, {
            attributes : {
                exclude : ['password']
            }
        })
    }

    async updateUser (userId : number, name : string, phone : string)
    : Promise<number> {
        const [rows] = await User.update({
            name,
            phone
        },{
            where : {id : userId}
        })
        return rows
    }

    async deleteUser (userId : number)
    : Promise<number> {
        return await User.destroy({where : {id : userId}})
    }

    // ----- Admin -----
    async getAllUsers (options : FindAndCountOptions)
    {
        return await User.findAndCountAll(options)
    }
}

export default new UserRepository()