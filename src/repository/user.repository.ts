import { FindAndCountOptions } from "sequelize"
import Address from "../models/address.model.js"
import User from "../models/user.model.js"
import { Order } from "../models/order.model.js"
import { Role, UserRole } from "../models/role.model.js"
import { Cart, CartItem } from "../models/cart.model.js"
import Wishlist from "../models/wishlist.model.js"

class UserRepository {
    async userById (userId : number)
    : Promise<User | null> {
        return await User.findByPk(userId, {
            attributes : {
                exclude : ['password']
            },
            include : [
                {
                    model : UserRole,
                    as : 'roles',
                    required : true,
                    attributes : ['id'],
                    include : [
                        {
                            model : Role,
                            as : 'role',
                            attributes : ['id', 'name']
                        }
                    ]
                }
            ]
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

    async getUser (userId : number)
    {
        return await User.findOne({
            where : {
                id : userId
            },
            attributes : [
                'id',
                'name',
                'email',
                'phone',
                'isEmailVerified',
                'isActive',
                'emailVerifiedAt',
                'createdAt'
            ],
            include : [
                {
                    model : UserRole,
                    as : 'roles',
                    required : true,
                    attributes : ['id'],
                    include : [{
                        model : Role,
                        as : 'role',
                        attributes : ['id', 'name']
                    }]
                },
                {
                    model : Address,
                    as : 'addresses',
                    required : false,
                    attributes : [
                        'id',
                        'addressLine',
                        'city',
                        'postalCode',
                        'isDefault',
                        'createdAt'
                    ]
                },
                {
                    model : Order,
                    as : 'orders',
                    required : false,
                    attributes : [
                        'id',
                        'orderNumber',
                        'status',
                        'paymentStatus',
                        'finalPrice',
                        'createdAt'
                    ],
                    limit: 3,
                    separate: true,
                    order: [
                        ['createdAt', 'DESC']
                    ]
                },
            ]
        })
    }

    async changeUserStatus (userId : number, currentStatus : boolean)
    {
        const [rows] = await User.update({
            isActive : !currentStatus
        },{
            where : {
                id : userId,
                isActive : currentStatus
            }
        })
        return rows === 1
    }

    async changeVerifiedEmailStatus (userId : number, currentStatus : boolean)
    {
        const [rows] = await User.update({
            isEmailVerified : !currentStatus,
            emailVerifiedAt : currentStatus ? null : new Date()
        },{
            where : {
                id : userId
            }
        })
        return rows === 1
    }
}

export default new UserRepository()