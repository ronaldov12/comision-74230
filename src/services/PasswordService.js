import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import PasswordDAO from "../dao/Password.dao.js";
import transporter from "../config/mailer.js";

export default class PasswordService {
    constructor() {
        this.passwordDAO = new PasswordDAO();
    }

    // genera token y envía email de recuperación
    async generateResetToken(email) {
        const user = await this.passwordDAO.findUserByEmail(email);
        if (!user) throw new Error("Usuario no encontrado");

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

        const mailOptions = {
            from: `"Ecommerce Soporte" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "Recuperación de contraseña",
            html: `<p>Hola ${user.first_name},</p>
                <p>Haz clic en el siguiente enlace para restablecer tu contraseña. Este enlace expira en 1 hora:</p>
                <a href="${resetLink}" target="_blank">Restablecer contraseña</a>`
        };

        await transporter.sendMail(mailOptions);
        return { message: "Correo de recuperación enviado correctamente" };
    }

    // restablece la contraseña usando token
    async resetPassword(token, newPassword) {
        if (!token) throw new Error("Token requerido");
        if (!newPassword) throw new Error("Nueva contraseña requerida");

        let payload;
        try {
            payload = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            throw new Error("Token inválido o expirado");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.passwordDAO.updatePassword(payload.id, hashedPassword);
        return { message: "Contraseña restablecida con éxito" };
    }
}
