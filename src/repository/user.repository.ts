import { FindAndCountOptions, Op } from "sequelize"
import Address from "../models/address.model.js"
import User from "../models/user.model.js"
import { Order } from "../models/order.model.js"
import { Role, UserRole } from "../models/role.model.js"
import sequelize from "../configs/sequelize.config.js"

class UserRepository {
    async userById (userId : number)
    : Promise<User | null> {
        return await User.findOne({
            where : {
                id : userId
            },
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
    : Promise<User | null> {
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

    async changeUserInfo(userId : number, data : Partial<Pick<User, "name" | "phone">>)
    : Promise<boolean> {
        const [rows] = await User.update(data,
            {
                where : {
                    id : userId
                }
            }
        )
        return rows === 1
    }

    async changeUserEmail (userId : number, email : string)
    : Promise<boolean> {
        const [rows] = await User.update({
            email,
            isEmailVerified : false,
            emailVerifiedAt : null
        },{
            where : {
                id : userId
            }
        })
        return rows === 1
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

    async statsMain() {
        const startOfToday = new Date()
        startOfToday.setHours(0, 0, 0, 0)

        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const [
            allUsersCount,
            activeUserCount,
            verifiedUserCount,
            newUsersTodayCount,
            newUsersThisMonth,
            [rolesCount],
        ] = await Promise.all([
            User.count(),

            User.count({
                where: {
                    isActive : true
                }
            }),

            User.count({
                where: {
                    isEmailVerified : true
                }
            }),

            User.count({
                where: {
                    createdAt : {
                        [Op.gte] : startOfToday
                    }
                }
            }),

            User.count({
                where: {
                    createdAt : {
                        [Op.gte] : startOfMonth
                    }
                }
            }),

            sequelize.query(`
                SELECT
                    r.id,
                    r.name,
                    COUNT(DISTINCT ur.user_id) AS userCount
                FROM roles r
                LEFT JOIN userroles ur
                    ON ur.role_id = r.id
                GROUP BY
                    r.id,
                    r.name
                ORDER BY
                    userCount DESC
            `)
        ])

        return {
            allUsersCount,
            activeUserCount,
            verifiedUserCount,
            newUsersTodayCount,
            newUsersThisMonth,
            rolesCount,
        }
    }
}

export default new UserRepository()