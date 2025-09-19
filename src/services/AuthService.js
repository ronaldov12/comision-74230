import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import transporter from '../config/mailer.js';
import UserDAO from '../dao/user.dao.js';

const userDAO = new UserDAO();

export default class AuthService {
    // Registro de usuario
    async register(data) {
        const { first_name, last_name, email, age, password } = data;

        // Verificar si usuario existe
        const exist = await userDAO.findByEmail(email);
        if (exist) return { error: 'El usuario ya existe' };

        // Encriptar contraseña
        const hashedPassword = bcrypt.hashSync(password, 10);

        const user = await userDAO.create({
            first_name,
            last_name,
            email,
            age,
            password: hashedPassword,
            role: 'user'
        });

        return user;
    }

    // Login con JWT
    async login(user) {
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        return token;
    }

    // Recuperación de contraseña
    async forgotPassword(email) {
        const user = await userDAO.findByEmail(email);
        if (!user) return { error: 'Usuario no encontrado' };

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

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
        return { message: 'Correo de recuperación enviado correctamente' };
    }
}
