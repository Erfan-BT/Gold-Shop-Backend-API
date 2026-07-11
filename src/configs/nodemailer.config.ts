import nodemailer from 'nodemailer'
import "dotenv/config"

export const transporter = nodemailer.createTransport({
    service : 'gmail',
    host : 'smtp.gmail.com',
    port : 587,
    secure : false,
    auth : {
        user : process.env.NODEMAILER_URL,
        pass : process.env.NODEMAILER_APP_PASSWORD
    }
})