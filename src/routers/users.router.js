import { Router } from 'express';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import passport from 'passport';
import { authorizeRoles } from '../middlewares/authorization.js';
import jwt from 'jsonwebtoken';
import { sendRecoveryEmail } from '../config/mailer.js'; 

const router = Router();

// ADMIN / USUARIOS

// Obtener todos los usuarios (solo admin)
router.get(
    '/',
    passport.authenticate('jwt', { session: false }),
    authorizeRoles('admin'),
    async (req, res) => {
        try {
            const users = await User.find().select('-password');
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener usuarios', error });
        }
    }
);

// Obtener usuario por ID (admin o el propio usuario)
router.get('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { id } = req.params;

        if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
            return res.status(403).json({ message: 'Acceso no autorizado' });
        }

        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuario', error });
    }
});

// Crear usuario (solo admin)
router.post(
    '/',
    passport.authenticate('jwt', { session: false }),
    authorizeRoles('admin'),
    async (req, res) => {
        try {
            const { first_name, last_name, email, age, password, role } = req.body;

            const exist = await User.findOne({ email });
            if (exist) {
                return res.status(400).json({ message: 'El usuario ya existe' });
            }

            const hashedPassword = bcrypt.hashSync(password, 10);

            const user = new User({
                first_name,
                last_name,
                email,
                age,
                password: hashedPassword,
                role: role || 'user'
            });

            await user.save();
            res.status(201).json({ message: 'Usuario creado con éxito' });
        } catch (error) {
            res.status(500).json({ message: 'Error al crear usuario', error });
        }
    }
);

// Actualizar usuario (admin o propio usuario)
router.put('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { id } = req.params;

        if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
            return res.status(403).json({ message: 'Acceso no autorizado' });
        }

        const updates = { ...req.body };

        if (updates.password) {
            updates.password = bcrypt.hashSync(updates.password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({ message: 'Usuario actualizado', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar usuario', error });
    }
});

// Eliminar usuario (solo admin)
router.delete(
    '/:id',
    passport.authenticate('jwt', { session: false }),
    authorizeRoles('admin'),
    async (req, res) => {
        try {
            const { id } = req.params;

            const deletedUser = await User.findByIdAndDelete(id);

            if (!deletedUser) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            res.json({ message: 'Usuario eliminado' });
        } catch (error) {
            res.status(500).json({ message: 'Error al eliminar usuario', error });
        }
    }
);

// RECUPERACION DE CONTRASEÑA

// Solicitar recuperación de contraseña
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        // Crear token que expira en 1 hora
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Enviar correo
        await sendRecoveryEmail(user, token);

        res.json({ message: 'Correo de recuperación enviado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al generar token', error });
    }
});

// Restablecer contraseña con token
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token y nueva contraseña son requeridos' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        // 🔹 Validar que la nueva contraseña no sea igual a la anterior
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({ message: 'La nueva contraseña no puede ser igual a la anterior' });
        }

        // Guardar nueva contraseña hasheada
        user.password = bcrypt.hashSync(newPassword, 10);
        await user.save();

        res.json({ message: 'Contraseña restablecida correctamente' });
    } catch (error) {
        res.status(400).json({ message: 'Token inválido o expirado', error });
    }
});

export default router;
