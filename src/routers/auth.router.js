import { Router } from 'express';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import passport from 'passport';

const router = Router();

// Registro de usuario
router.post('/register', async (req, res) => {
    try {
        const { first_name, last_name, email, age, password } = req.body;

        // Verificar si usuario existe
        const exist = await User.findOne({ email });
        if (exist) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Encriptar contraseña con bcrypt.hashSync (consigna)
        const hashedPassword = bcrypt.hashSync(password, 10);

        const user = new User({
            first_name,
            last_name,
            email,
            age,
            password: hashedPassword,
            role: 'user' // Valor por defecto
        });

        await user.save();

        res.status(201).json({ message: 'Usuario creado con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar usuario', error });
    }
});

// Login con Passport local y generación JWT
router.post('/login', (req, res, next) => {
    passport.authenticate('login', { session: false }, (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            return res.status(401).json({ message: info.message || 'No autorizado' });
        }
        // Generar token JWT
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        return res.json({ message: 'Login exitoso', token });
    })(req, res, next);
});

export default router;

