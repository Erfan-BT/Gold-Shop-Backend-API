import { Role, UserRole } from "../models/role.model.js"
import User from "../models/user.model.js"
import { Roles } from "../types/role.enum.js"

export async function roleSeeder () {
    const owner = await Role.findOrCreate({
        where : {name : 'Owner'},
        defaults : {id : 1, name : 'Owner'}
    })
    const admin = await Role.findOrCreate({
        where : {name : 'Admin'},
        defaults : {id : 2, name : 'Admin'}
    })
    const customer = await Role.findOrCreate({
        where : {name : 'Customer'},
        defaults : {id : 3, name : 'Customer'}
    })
    const support = await Role.findOrCreate({
        where : {name : 'Support'},
        defaults : {id : 4, name : 'Support'}
    })
    const inventory = await Role.findOrCreate({
        where : {name : 'Inventory'},
        defaults : {id : 5, name : 'Inventory'}
    })
    const orderManager = await Role.findOrCreate({
        where : {name : 'OrderManager'},
        defaults : {id : 6, name : 'OrderManager'}
    })
    const finance = await Role.findOrCreate({
        where : {name : 'Finance'},
        defaults : {id : 7, name : 'Finance'}
    })
}

export async function userRoleSeeder () {
    const ownerRole = await UserRole.findOrCreate({
        where : {userId : 1},
        defaults : {
            userId : 1,
            roleId : Roles.OWNER
        }
    })
    const adminRole = await UserRole.findOrCreate({
        where : {userId : 2},
        defaults : {
            userId : 2,
            roleId : Roles.ADMIN
        }
    })
    const customerRole1 = await UserRole.findOrCreate({
        where : {userId : 3},
        defaults : {
            userId : 3,
            roleId : Roles.CUSTOMER
        }
    })
    const customerRole2 = await UserRole.findOrCreate({
        where : {userId : 4},
        defaults : {
            userId : 4,
            roleId : Roles.CUSTOMER
        }
    })
}