import nodemailer from 'nodemailer'
import { env } from './env.config.js'

export const transporter = nodemailer.createTransport({
    service : 'gmail',
    host : 'smtp.gmail.com',
    port : 587,
    secure : false,
    auth : {
        user : env.NODEMAILER_URL,
        pass : env.NODEMAILER_APP_PASSWORD
    }
})