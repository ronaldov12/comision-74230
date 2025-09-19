import { Router } from 'express';
import passport from 'passport';
import { authorizeRoles } from '../middlewares/authorization.js';
import {
    getMyCart,
    addProduct,
    removeProduct,
    clearCart,
    purchaseCart
} from '../controllers/CartController.js';

const router = Router();

router.get('/mine', passport.authenticate('jwt', { session: false }), authorizeRoles('user'), getMyCart);
router.post('/products/:pid', passport.authenticate('jwt', { session: false }), authorizeRoles('user'), addProduct);
router.delete('/products/:pid', passport.authenticate('jwt', { session: false }), authorizeRoles('user'), removeProduct);
router.delete('/', passport.authenticate('jwt', { session: false }), authorizeRoles('user'), clearCart);
router.post('/purchase', passport.authenticate('jwt', { session: false }), authorizeRoles('user'), purchaseCart);

export default router;
