import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Transporter centralizado
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Función para enviar correo de recuperación
export const sendRecoveryEmail = async (user, token) => {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const mailOptions = {
        from: `"Ecommerce Soporte" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Recuperación de contraseña',
        html: `
            <p>Hola ${user.first_name},</p>
            <p>Haz clic en el siguiente enlace para restablecer tu contraseña. Este enlace expira en 1 hora:</p>
            <a href="${resetLink}" target="_blank">Restablecer contraseña</a>
        `
    };

    await transporter.sendMail(mailOptions);
};

export default transporter;
