// src/services/TicketService.js
import Ticket from '../models/Ticket.js';
import CartService from './CartService.js';
import Product from '../models/Product.js';

export default class TicketService {
    constructor() {
        this.cartService = new CartService();
    }

    // Generar ticket de compra
    async createTicket(userId) {
        // Verificar stock
        const { productsInStock, productsOutOfStock, cartId } = await this.cartService.verifyStock(userId);

        if (productsInStock.length === 0) {
            throw new Error('No hay productos disponibles en stock para la compra.');
        }

        // Calcular total
        let total = 0;
        for (const item of productsInStock) {
            total += item.product.price * item.quantity;
        }

        // Reducir stock de productos comprados
        await this.cartService.reduceStock(productsInStock);

        //  Crear ticket
        const ticket = await Ticket.create({
            user: userId,
            products: productsInStock.map(item => ({
                product: item.product._id,
                quantity: item.quantity
            })),
            total
        });

        //  Vaciar carrito
        await this.cartService.clearCart(userId);

        //  Retornar ticket y productos no comprados (por falta de stock)
        return { ticket, productsOutOfStock };
    }
}
