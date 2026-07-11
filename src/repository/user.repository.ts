import User from "../models/user.model.js"
import { UserAttributes } from "../types/user.interface.js"

class UserRepository {
    async userById (userId : number)
    : Promise<UserAttributes | null> {
        return (await User.findByPk(userId, {
            attributes : {
                exclude : ['password']
            }
        }))?.toJSON() ?? null
    }
}

export default new UserRepository()