import { Router } from 'express';
import ProductRepository from '../repositories/ProductRepository.js';
import passport from 'passport';
import { authorizeRoles } from '../middlewares/authorization.js';

const router = Router();
const repo = new ProductRepository();

// Obtener todos los productos (público)
router.get('/', async (req, res) => {
    try {
        const products = await repo.getProducts();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Crear producto (solo admin)
router.post(
    '/',
    passport.authenticate('jwt', { session: false }),
    authorizeRoles('admin'),
    async (req, res) => {
        try {
            const product = await repo.addProduct(req.body);
            res.status(201).json(product);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
);

// Obtener producto por id (público)
router.get('/:id', async (req, res) => {
    try {
        const product = await repo.getProductById(req.params.id);
        res.json(product);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Actualizar producto (solo admin)
router.put(
    '/:id',
    passport.authenticate('jwt', { session: false }),
    authorizeRoles('admin'),
    async (req, res) => {
        try {
            const updated = await repo.updateProduct(req.params.id, req.body);
            res.json(updated);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }
);

// Eliminar producto (solo admin)
router.delete(
    '/:id',
    passport.authenticate('jwt', { session: false }),
    authorizeRoles('admin'),
    async (req, res) => {
        try {
            await repo.deleteProduct(req.params.id);
            res.json({ message: 'Producto eliminado' });
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }
);

export default router;
