import { Router } from 'express';
import passport from 'passport';
import TicketRepository from '../repositories/TicketRepository.js';
import { authorizeRoles } from '../middlewares/authorization.js'; // <-- corregido
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const ticketRepo = new TicketRepository();

// Crear ticket de compra (solo usuario)
router.post(
    '/',
    passport.authenticate('jwt', { session: false }),
    authorizeRoles('user'),
    async (req, res) => {
        try {
            const ticket = await ticketRepo.createTicket(req.user._id, uuidv4());
            res.status(201).json({ message: 'Compra realizada', ticket });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
);

// Obtener todos los tickets (solo admin)
router.get(
    '/',
    passport.authenticate('jwt', { session: false }),
    authorizeRoles('admin'),
    async (req, res) => {
        try {
            const tickets = await ticketRepo.getAllTickets();
            res.json(tickets);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
);

// Obtener tickets de un usuario (usuario dueño o admin)
router.get(
    '/user/:userId',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const { userId } = req.params;

            if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
                return res.status(403).json({ message: 'Acceso no autorizado' });
            }

            const tickets = await ticketRepo.getTicketsByUser(userId);
            res.json(tickets);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
);

// Obtener ticket por ID (usuario dueño o admin)
router.get(
    '/:ticketId',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const ticket = await ticketRepo.getTicketById(req.params.ticketId);

            if (req.user.role !== 'admin' && ticket.user.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Acceso no autorizado' });
            }

            res.json(ticket);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }
);

export default router;
