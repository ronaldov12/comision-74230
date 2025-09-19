import { Router } from 'express';
import passport from 'passport';
import { authorizeRoles } from "../middlewares/authorization.js";
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    forgotPassword,
    resetPassword
} from '../controllers/UsersController.js';

const router = Router();

// ADMIN / USUARIOS
router.get('/', passport.authenticate('jwt', { session: false }), authorizeRoles('admin'), getAllUsers);
router.get('/:id', passport.authenticate('jwt', { session: false }), getUserById);
router.post('/', passport.authenticate('jwt', { session: false }), authorizeRoles('admin'), createUser);
router.put('/:id', passport.authenticate('jwt', { session: false }), updateUser);
router.delete('/:id', passport.authenticate('jwt', { session: false }), authorizeRoles('admin'), deleteUser);

// RECUPERACION DE CONTRASEÑA
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
