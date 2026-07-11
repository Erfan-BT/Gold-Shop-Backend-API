import { Model } from "sequelize";
import User from "../models/user.model.js";
import { UserAttributes, UserCreationAttributes } from "../types/user.interface.js";

class AuthRepository {
    async userByEmail (email : string) 
    : Promise<UserAttributes | null> {
        return (await User.findOne({
            where : {
                email
            },
            attributes : {
                exclude : ['password']
            }
        }))?.toJSON() ?? null
    }
    async existsEmail (email : string)
    : Promise<boolean> {
        return (await User.findOne({where : {email}})) ? true : false
    }
    async isEmailVerified (userId : number)
    : Promise<boolean> {
        return (await User.findByPk(userId))?.toJSON().isEmailVerified ?? false
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
    async userPassword (email : string)
    : Promise<string> {
        return (await User.findOne({where : {email}}))!.toJSON().password
    }
}

export default new AuthRepository()