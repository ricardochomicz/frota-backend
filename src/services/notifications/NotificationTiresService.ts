import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class NotificationService {
    private static transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true', // true para 465, false para outras portas
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    static async sendEmail({ to, subject, message }: { to: string; subject: string; message: string }) {
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: 'ricardo.chomicz@gmail.com',
            subject,
            text: message,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`📧 Email enviado para ${to}: ${subject}`);
        } catch (error) {
            console.error('Erro ao enviar email:', error);
        }
    }
}

export default NotificationService;
