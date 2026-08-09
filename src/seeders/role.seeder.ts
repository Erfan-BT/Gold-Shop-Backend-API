import { Role, UserRole } from "../models/role.model.js"
import { Roles, RolesTitle } from "../types/role.enum.js"

export async function roleSeeder () {
    const owner = await Role.findOrCreate({
        where : {name : RolesTitle.OWNER},
        defaults : {id : 1, name : RolesTitle.OWNER}
    })
    const admin = await Role.findOrCreate({
        where : {name : RolesTitle.ADMIN},
        defaults : {id : 2, name : RolesTitle.ADMIN}
    })
    const customer = await Role.findOrCreate({
        where : {name : RolesTitle.CUSTOMER},
        defaults : {id : 3, name : RolesTitle.CUSTOMER}
    })
    const support = await Role.findOrCreate({
        where : {name : RolesTitle.SUPPORT},
        defaults : {id : 4, name : RolesTitle.SUPPORT}
    })
    const inventory = await Role.findOrCreate({
        where : {name : RolesTitle.INVENTORY},
        defaults : {id : 5, name : RolesTitle.INVENTORY}
    })
    const orderManager = await Role.findOrCreate({
        where : {name : RolesTitle.ORDERMANAGER},
        defaults : {id : 6, name : RolesTitle.ORDERMANAGER}
    })
    const finance = await Role.findOrCreate({
        where : {name : RolesTitle.FINANCE},
        defaults : {id : 7, name : RolesTitle.FINANCE}
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