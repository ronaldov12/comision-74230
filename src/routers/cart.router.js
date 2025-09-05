import { Router } from 'express';
import passport from 'passport';
import { authorizeRoles } from '../middlewares/authorization.js';
import CartService from '../services/CartService.js';

const router = Router();
const cartService = new CartService();

// Obtener el carrito del usuario logueado
router.get(
    '/mine',
    passport.authenticate('jwt', { session: false }),
    authorizeRoles('user'),
    async (req, res) => {
        try {
            const cart = await cartService.cartRepo.getOrCreateCartByUser(req.user._id);
            res.json(cart);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
);

// Agregar producto al carrito (solo usuario)
router.post(
    '/products/:pid',
    passport.authenticate('jwt', { session: false }),
    authorizeRoles('user'),
    async (req, res) => {
        try {
            const { pid } = req.params;
            const quantity = Number(req.body.quantity) || 1;
            const updatedCart = await cartService.cartRepo.addProductToCart(req.user._id, pid, quantity);

            res.status(200).json({
                message: 'Producto agregado al carrito',
                cart: updatedCart,
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
);

// Eliminar un producto del carrito (todo el ítem)
router.delete(
    '/products/:pid',
    passport.authenticate('jwt', { session: false }),
    authorizeRoles('user'),
    async (req, res) => {
        try {
            const { pid } = req.params;
            const cart = await cartService.cartRepo.removeProductFromCart(req.user._id, pid);
            res.json({ message: 'Producto eliminado del carrito', cart });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
);

// Vaciar el carrito
router.delete(
    '/',
    passport.authenticate('jwt', { session: false }),
    authorizeRoles('user'),
    async (req, res) => {
        try {
            const cart = await cartService.clearCart(req.user._id);
            res.json({ message: 'Carrito vaciado', cart });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
);

// Endpoint de compra: verificar stock y reducir
router.post(
    '/purchase',
    passport.authenticate('jwt', { session: false }),
    authorizeRoles('user'),
    async (req, res) => {
        try {
            // verificar stock
            const { productsInStock, productsOutOfStock, cartId } = await cartService.verifyStock(req.user._id);

            if (productsOutOfStock.length > 0) {
                return res.status(400).json({
                    message: 'Algunos productos no tienen stock suficiente',
                    productsOutOfStock
                });
            }

            // reducir stock
            await cartService.reduceStock(productsInStock);

            // vaciar carrito
            await cartService.clearCart(req.user._id);

            res.status(200).json({
                message: 'Compra realizada con éxito',
                cartId,
                productsPurchased: productsInStock
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
);

export default router;
