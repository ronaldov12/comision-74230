import Ticket from '../models/Ticket.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';

export default class TicketRepository {

    // Crear ticket de compra
    async createTicket(userId, ticketCode) {
        const cart = await Cart.findOne({ user: userId }).populate('products.product');
        if(!cart || cart.products.length === 0) {
            throw new Error('El carrito está vacío');
        }

        let total = 0;
        const productsToUpdate = [];

        // Verificar stock y calcular total
        cart.products.forEach(item => {
            if(item.quantity > item.product.stock) {
                throw new Error(`No hay suficiente stock de ${item.product.title}`);
            }
            total += item.product.price * item.quantity;
            productsToUpdate.push({ id: item.product._id, quantity: item.quantity });
        });

        // Actualizar stock de productos
        for(const p of productsToUpdate) {
            await Product.findByIdAndUpdate(p.id, { $inc: { stock: -p.quantity } });
        }

        // Crear ticket
        const ticket = await Ticket.create({
            user: userId,
            products: cart.products.map(p => ({ product: p.product._id, quantity: p.quantity })),
            total,
            code: ticketCode // agregamos el código único
        });

        // Vaciar carrito
        cart.products = [];
        await cart.save();

        return ticket;
    }

    // Obtener todos los tickets (solo admin)
    async getAllTickets() {
        return await Ticket.find().populate('products.product').populate('user', '-password');
    }

    // Obtener todos los tickets de un usuario
    async getTicketsByUser(userId) {
        return await Ticket.find({ user: userId }).populate('products.product');
    }

    // Obtener ticket por ID
    async getTicketById(ticketId) {
        const ticket = await Ticket.findById(ticketId).populate('products.product');
        if(!ticket) throw new Error(`Ticket con id ${ticketId} no encontrado`);
        return ticket;
    }
}
