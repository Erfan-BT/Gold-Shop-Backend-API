import authRepository from "../repository/auth.repository.js"
import { ConflictError, UnauthorizedError } from "../utils/appError.js"
import bcrypt from 'bcrypt'
import tokenService from "./token.service.js"
import roleRepository from "../repository/role.repository.js"

class AuthService {
    async register (name : string, email : string, phone : string, password : string) {
        // Check Exists Email
        const existsEmail : boolean = await authRepository.existsEmail(email)
        if (existsEmail)
            throw new ConflictError('This Email Already Exists')
        // Hash Password
        const hashedPassword : string = await bcrypt.hash(password, 12)
        // Add User To DataBase
        const user = await authRepository.register(name, email, phone, hashedPassword)
        // Set User Role
        const setRole = await roleRepository.setUserRole(user.id, 3)
        // Token
        const tokens = await tokenService.generateTokens({
            userId : user.id,
            name,
            email
        })

        return {
            userId : user.id,
            name,
            email,
            tokens
        }
    }
    async login (email : string, password : string) {
        // Check Exists Email
        const existsEmail : boolean = await authRepository.existsEmail(email)
        if (!existsEmail)
            throw new UnauthorizedError('Email Or Password Is Incorrect')
        // Get User Password & Check Password
        const hashedPassword : string = await authRepository.userPassword(email)
        console.log(hashedPassword);
        console.log(await bcrypt.hash('admin123', 12));
        
        
        const checkPassword : boolean = await bcrypt.compare(password, hashedPassword)
        if (!checkPassword) {
            console.log("Wrong pass");
            throw new UnauthorizedError('Email Or Password Is Incorrect')
        }
            
        // Get User
        const user = await authRepository.userByEmail(email)
        // Token
        const tokens = await tokenService.generateTokens({
            userId : user!.id,
            name : user!.name,
            email
        })

        return {
            userId : user!.id,
            name : user!.name,
            email,
            tokens
        }
    }
}

export default new AuthService()