import User from "../models/user.model.js"

export async function userSeeder () {
    const ownerU = await User.findOrCreate({
        where : {email : 'owner@gmail.com'},
        defaults : {
            id : 1,
            name : 'Owner',
            email : 'owner@gmail.com',
            phone : '09123456789',
            password : '$2b$12$O5kQW/PfPZDxoFiyBeILtOEFH3DtlrvAp87N4GLZbyLEs14nfys4u', // admin123
            isEmailVerified : true,
            emailVerifiedAt : new Date(),
            isActive : true,  
        }
    })
    const adminU = await User.findOrCreate({
        where : {email : 'admin@gmail.com'},
        defaults : {
            id : 2,
            name : 'Admin',
            email : 'admin@gmail.com',
            phone : '09123456788',
            password : '$2b$12$O5kQW/PfPZDxoFiyBeILtOEFH3DtlrvAp87N4GLZbyLEs14nfys4u', // admin123
            isEmailVerified : true,
            emailVerifiedAt : new Date(),
            isActive : true,  
        }
    })
    const customer1 = await User.findOrCreate({
        where : {email : 'user1@gmail.com'},
        defaults : {
            id : 3,
            name : 'User1',
            email : 'user1@gmail.com',
            phone : '09123456787',
            password : '$2b$12$O5kQW/PfPZDxoFiyBeILtOEFH3DtlrvAp87N4GLZbyLEs14nfys4u', // admin123
            isEmailVerified : true,
            emailVerifiedAt : new Date(),
            isActive : true,  
        }
    })
    const customer2 = await User.findOrCreate({
        where : {email : 'user2@gmail.com'},
        defaults : {
            id : 4,
            name : 'User2',
            email : 'user2@gmail.com',
            phone : '09123456786',
            password : '$2b$12$O5kQW/PfPZDxoFiyBeILtOEFH3DtlrvAp87N4GLZbyLEs14nfys4u', // admin123
            isEmailVerified : false,
            // emailVerifiedAt : new Date(),
            isActive : true,  
        }
    })    
}