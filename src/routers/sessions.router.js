// sessions.routes.js
import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import UserDTO from '../dtos/UserDTO.js'; // DTO para filtrar datos sensibles

const router = Router();

// Endpoint para obtener datos del usuario actual
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
    const userDTO = new UserDTO(req.user);
    res.json({ user: userDTO });
});

//  Login de usuario
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword) return res.status(401).json({ message: 'Contraseña incorrecta' });

        // Crear token JWT válido por 1 hora
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Login exitoso',
            token
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al iniciar sesión', error });
    }
});

export default router;
