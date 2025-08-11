import { Router } from 'express';
import passport from 'passport';

const router = Router();

// Ruta protegida que devuelve datos del usuario logueado
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({ user: req.user });
});

export default router;
