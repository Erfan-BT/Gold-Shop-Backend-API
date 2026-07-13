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
}

export default new UserRepository()