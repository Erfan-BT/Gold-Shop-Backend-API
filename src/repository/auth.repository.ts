import { Model, Transaction } from "sequelize";
import User from "../models/user.model.js";

class AuthRepository {
    async userByEmail (email : string) 
    : Promise<User | null> {
        return await User.findOne({
            where : {
                email
            },
            attributes : {
                exclude : ['password']
            }
        })
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
    : Promise<User> {
        return await User.create({
            name,
            email,
            phone,
            password
        }, { transaction })
    }

    async userWithPassword (email : string)
    : Promise<User | null> {
        return await User.findOne({where : {email}})
    }

    async userWithPasswordById (userId : number)
    : Promise<User | null> {
        return await User.findOne({where : {id : userId}})
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