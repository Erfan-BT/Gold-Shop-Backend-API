import { Response , NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import usersService from "../services/users.service.js";
import addressService from "../services/address.service.js";
import { AddressDto } from "../validation/address.validation.js";

class UserController {
    async updateUserInfo (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
            const { name , phone } = req.body
            const result = await usersService.updateUser(userId, name, phone)

            res.status(200).json({
                success : true,
                msg : 'Change User Info',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async deleteUser (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
            const { password } = req.body
            await usersService.deleteUser(userId, password)

            res.status(200).json({
                success : true,
                msg : 'Delete User',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

    // Address
    async userAddresses (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
            const result = await addressService.userAddresses(userId)

            res.status(200).json({
                success : true,
                msg : 'User Addresses',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async userAddressById (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
            const { id } = req.params
            const result = await addressService.userAddressById(userId, Number(id))

            res.status(200).json({
                success : true,
                msg : 'User Address',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async createAddress (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
            const addressData : AddressDto = req.body
            const result = await addressService.createAddress(userId, addressData)
            
            res.status(201).json({
                success : true,
                msg : 'Create Address',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async updateAddressInfo (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
            const addressData : AddressDto = req.body
            const { id } = req.params
            const result = await addressService.updateAddressInfo(userId, Number(id), addressData)
            
            res.status(201).json({
                success : true,
                msg : 'Change Address',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async setDefaultAddress (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
            const { id } = req.params
            await addressService.setDefaultAddress(userId, Number(id))

            res.status(200).json({
                success : true,
                msg : 'Default Address',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

    async deleteAddress (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
            const { id } = req.params
            await addressService.deleteAddress(userId, Number(id))

            res.status(200).json({
                success : true,
                msg : 'Delete Address',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new UserController()