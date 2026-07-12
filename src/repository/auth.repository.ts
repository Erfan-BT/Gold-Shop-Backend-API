import { Model, Transaction } from "sequelize";
import User from "../models/user.model.js";
import { UserAttributes, UserCreationAttributes } from "../types/user.interface.js";
import sequelize from "../configs/sequelize.config.js";

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
    async register (name : string, email : string, phone : string, password : string, transaction : Transaction) 
    : Promise<UserAttributes> {
        return (await User.create({
            name,
            email,
            phone,
            password
        }, { transaction })).toJSON()
    }
    async userWithPassword (email : string)
    : Promise<UserAttributes> {
        return (await User.findOne({where : {email}}))!.toJSON()
    }
    async verifyEmail (userId : number)
    : Promise<number> {
        const [rows] = await User.update({
            isEmailVerified : true,
            emailVerifiedAt : new Date()
        },{
            where : {
                id : userId
            }
        })
        return rows
    }
    async changeUserPassword (userId : number, password : string)
    : Promise<number> {
        const [rows] = await User.update({
            password
        },{
            where : {
                id : userId
            }
        })
        return rows
    }
}

export default new AuthRepository()