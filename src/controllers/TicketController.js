import TicketService from '../services/TicketService.js';

export default class TicketController {
    constructor() {
        this.ticketService = new TicketService();
    }

    async createTicket(req, res) {
        try {
            const { ticket, productsOutOfStock } = await this.ticketService.createTicket(req.user._id);

            res.status(201).json({
                message: 'Compra realizada',
                ticket,
                productsOutOfStock,
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}
