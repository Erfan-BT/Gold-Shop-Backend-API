import { Response , NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import usersService from "../services/users.service.js";
import addressService from "../services/address.service.js";
import { AddressDto, AddressIdDto, ChangeAddressDto } from "../validation/address.validation.js";
import { ChangeUserDto } from "../validation/users.validation.js";
import { PasswordDto } from "../validation/auth.validation.js";

class UserController {
    async changeUser (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
            const userData = req.validated.body as ChangeUserDto
            const result = await usersService.changeUser(userId, userData)

            res.status(200).json({
                success : true,
                msg : 'User Information Changed Successfully',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async deleteUser (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
            const { password } = req.validated.body as PasswordDto
            await usersService.deleteUser(userId, password)

            res.status(200).json({
                success : true,
                msg : 'User Successfully Deleted',
                data : null
            })
        } catch (error) {
            next(error)
        }
    }

    // Address
    async getUserAddresses (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
            const result = await addressService.getUserAddresses(userId)

            res.status(200).json({
                success : true,
                msg : 'User Addresses Successfully Found',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async getUserAddress (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
            const { addressId } = req.validated.params as AddressIdDto
            const result = await addressService.getUserAddress(userId, addressId)

            res.status(200).json({
                success : true,
                msg : 'Address Successfully Found',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async createAddress (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
            const addressData = req.validated.body as AddressDto
            const result = await addressService.createAddress(userId, addressData)
            
            res.status(201).json({
                success : true,
                msg : 'Address Created Successfully',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async changeAddress (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
            const addressData = req.validated.body as ChangeAddressDto
            const { addressId } = req.validated.params as AddressIdDto
            const result = await addressService.changeAddress(userId, addressId, addressData)
            
            res.status(200).json({
                success : true,
                msg : 'Address Changed Successfully',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async setDefaultAddress (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
            const { addressId } = req.validated.params as AddressIdDto
            await addressService.setDefaultAddress(userId, addressId)

            res.status(200).json({
                success : true,
                msg : 'Default Address Set',
                data : null
            })
        } catch (error) {
            next(error)
        }
    }

    async deleteAddress (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
            const { addressId } = req.validated.params as AddressIdDto
            await addressService.deleteAddress(userId, addressId)

            res.status(200).json({
                success : true,
                msg : 'Address Successfully Deleted',
                data : null
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new UserController()