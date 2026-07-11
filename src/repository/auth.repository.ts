import { Model } from "sequelize";
import User from "../models/user.model.js";
import { UserAttributes, UserCreationAttributes } from "../types/user.interface.js";

class AuthRepository {
    async existsEmail (email : string) : Promise<boolean> {
        return (await User.findOne({where : {email}})) ? true : false
    }
    async register (name : string, email : string, phone : string, password : string) 
    : Promise<UserAttributes> {
        return (await User.create({
            name,
            email,
            phone,
            password
        })).toJSON()
    }
}

export default new AuthRepository()