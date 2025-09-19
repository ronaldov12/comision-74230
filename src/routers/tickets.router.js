import { Router } from 'express';
import passport from 'passport';
import { authorizeRoles } from '../middlewares/authorization.js';
import TicketController from '../controllers/TicketController.js';


const router = Router();
const ticketController = new TicketController();

// Crear ticket de compra (solo usuario)
router.post(
    '/',
    passport.authenticate('jwt', { session: false }),
    authorizeRoles('user'),
    ticketController.createTicket.bind(ticketController) //llama al metodo del controller
);

export default router;
