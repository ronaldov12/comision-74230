import nodemailer from 'nodemailer';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

export default class PasswordService {
    constructor() {
        // Configuración del transporter de nodemailer usando variables de entorno
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    // genera un token seguro de recuperacion y lo guarda temporalmente en el usuario
    async generateResetToken(userEmail) {
        const user = await User.findOne({ email: userEmail });
        if (!user) throw new Error('Usuario no encontrado');

        // crear token aleatorio
        const token = crypto.randomBytes(32).toString('hex');

        // guardar token y fecha de expiración en el usuario
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000; 
        await user.save();

        // enviar email con link de recuperacion
        const resetUrl = `http://localhost:8080/api/password/reset/${token}`;
        await this.transporter.sendMail({
            from: `"Ecommerce" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Recuperación de contraseña',
            html: `<p>Haz click <a href="${resetUrl}">aquí</a> para restablecer tu contraseña. El enlace expira en 1 hora.</p>`
        });

        return { message: 'Correo de recuperación enviado' };
    }

    // Verificar token y permitir cambio de contraseña
    async resetPassword(token, newPassword) {
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiration: { $gt: Date.now() }
        });

        if (!user) throw new Error('Token inválido o expirado');

        // Evitar que sea la misma contraseña anterior
        const match = await bcrypt.compare(newPassword, user.password);
        if (match) throw new Error('No puedes usar la misma contraseña anterior');

        // Hashear nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        // limpiar token y expiración
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        await user.save();

        return { message: 'Contraseña restablecida correctamente' };
    }
}
