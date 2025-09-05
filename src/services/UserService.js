import User from "../models/User.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";

export default class UserService {
    constructor() {
        // Configuracion del transportador de email
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    // rnviar email de recuperación con token de 1 hora
    async sendResetPasswordEmail(email) {
        const user = await User.findOne({ email });
        if (!user) throw new Error("Usuario no encontrado");

        const token = crypto.randomBytes(20).toString("hex");
        const expiration = Date.now() + 3600000; 

        // Guardar token temporalmente en usuario
        user.resetToken = token;
        user.resetTokenExpires = expiration;
        await user.save();

        const resetUrl = `http://localhost:8080/api/users/reset-password/${token}`;

        await this.transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Recuperación de contraseña",
            html: `<p>Para restablecer tu contraseña, haz click <a href="${resetUrl}">aquí</a>. Este enlace expira en 1 hora.</p>`
        });

        return { message: "Email de recuperación enviado" };
    }

    // restablecer contraseña usando token
    async resetPassword(token, newPassword) {
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpires: { $gt: Date.now() } // verifica que no haya expirado
        });

        if (!user) throw new Error("Token inválido o expirado");

        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) throw new Error("La nueva contraseña no puede ser igual a la anterior");

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        // limpiar token y expiracion
        user.resetToken = null;
        user.resetTokenExpires = null;

        await user.save();

        return { message: "Contraseña restablecida correctamente" };
    }
}
