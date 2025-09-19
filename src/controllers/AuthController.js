import AuthService from '../services/AuthService.js';
import passport from 'passport';

const authService = new AuthService();

export default class AuthController {
    static async register(req, res) {
        try {
            const result = await authService.register(req.body);
            if (result.error) return res.status(400).json({ message: result.error });
            res.status(201).json({ message: 'Usuario creado con éxito' });
        } catch (error) {
            res.status(500).json({ message: 'Error al registrar usuario', error });
        }
    }

    static login(req, res, next) {
        passport.authenticate('login', { session: false }, async (err, user, info) => {
            if (err) return next(err);
            if (!user) return res.status(401).json({ message: info.message || 'No autorizado' });

            const token = await authService.login(user);
            return res.json({ message: 'Login exitoso', token });
        })(req, res, next);
    }

    static async forgotPassword(req, res) {
        try {
            const result = await authService.forgotPassword(req.body.email);
            if (result.error) return res.status(404).json({ message: result.error });
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: 'Error al generar token', error });
        }
    }
}
