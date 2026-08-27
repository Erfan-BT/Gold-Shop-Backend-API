import { Model, Transaction } from "sequelize";
import User from "../models/user.model.js";

class AuthRepository {
    async getUserByEmail (email : string) 
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

    async getUserById (userId : number) 
    : Promise<User | null> {
        return await User.findOne({
            where : {
                id : userId
            },
            attributes : {
                exclude : ['password']
            }
        })
    }

    async getUserPasswordById (userId : number)
    : Promise<User | null> {
        return await User.findOne({
            where : {
                id : userId,
            },
            attributes : ['password']
        })
    }

    async isEmailVerified (userId : number)
    : Promise<boolean> {
        return (await User.findByPk(userId))?.isEmailVerified ?? false
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

    async verifyEmail (userId : number)
    : Promise<boolean> {
        const [rows] = await User.update({
            isEmailVerified : true,
            emailVerifiedAt : new Date()
        },{
            where : {
                id : userId,
                isEmailVerified : false,
                isActive : true
            }
        })
        return rows === 1
    }
    
    async changeUserPassword (userId : number, password : string)
    : Promise<boolean> {
        const [rows] = await User.update({
            password
        },{
            where : {
                id : userId,
                isActive : true
            }
        })
        return rows === 1
    }
}

export default new AuthRepository()