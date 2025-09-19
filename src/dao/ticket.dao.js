import Ticket from '../models/Ticket.js';

export default class TicketDAO {
    async create(ticketData) {
        return await Ticket.create(ticketData);
    }
}
