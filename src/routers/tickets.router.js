// src/routes/ticket.routes.js
import { Router } from 'express';
import passport from 'passport';
import { authorizeRoles } from '../middlewares/authorization.js';
import TicketService from '../services/TicketService.js';

const router = Router();
const ticketService = new TicketService();

// Crear ticket de compra (solo usuario)
router.post(
    '/',
    passport.authenticate('jwt', { session: false }),
    authorizeRoles('user'),
    async (req, res) => {
        try {
            const { ticket, productsOutOfStock } = await ticketService.createTicket(req.user._id);

            res.status(201).json({
                message: 'Compra realizada',
                ticket,
                productsOutOfStock, // se informa qué no pudo comprarse
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
);

export default router;
