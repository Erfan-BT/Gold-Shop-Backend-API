import 'dotenv/config'
import { transporter } from '../configs/nodemailer.config.js'
import { logger } from '../configs/pino.config.js'
import { env } from '../configs/env.config.js';

class EmailService {
    async sendVerifiedEmail(
        token: string,
        name: string,
        email: string
    ): Promise<void> {
        const mailOptions = {
            from: env.NODEMAILER_URL,
            to: email,
            subject: "Verify Email",
            html: `
                <center>
                    <h1>سلام ${name}</h1>
                    <h2>برای تایید ایمیل روی لینک زیر کلیک کنید</h2>
                    <hr>
                    <a href="http://localhost:3000/api/v1/auth/verify-email/confirm/${token}">
                        تایید ایمیل
                    </a>
                </center>
            `
        };

        const info = await transporter.sendMail(mailOptions);

        logger.info({response : info.response}, 'EmailService - Send Verify Email Response');
    }

    async sendForgetPasswordEmail(
        token: string,
        name: string,
        email: string
    ): Promise<void> {
        const mailOptions = {
            from: env.NODEMAILER_URL,
            to: email,
            subject: "Forget Password",
            html : `
                <center>
                    <h1>سلام ${name}</h1>
                    <h2>برای تغییر دادن رمزعبورت بزن روی لینک زیر</h2>
                    <hr>
                    <a href="http://localhost:3000/api/v1/auth/reset-password/${token}">
                        تغییر رمزعبور
                    </a>
                </center>
            `
        };

        const info = await transporter.sendMail(mailOptions);

        logger.info({response : info.response}, 'EmailService - Send ForgerPassword Email Response');
    }
}

export default new EmailService()