import TicketDAO from '../dao/ticket.dao.js';
import CartDAO from '../dao/cart.dao.js';
import ProductDAO from '../dao/product.dao.js';

export default class TicketService {
    constructor() {
        this.ticketDAO = new TicketDAO();
        this.cartDAO = new CartDAO();
        this.productDAO = new ProductDAO();
    }

    async createTicket(userId) {
        const cart = await this.cartDAO.getOrCreateCartByUser(userId);
        if (!cart || cart.products.length === 0) throw new Error("Carrito vacío");

        const productsOutOfStock = [];
        const productsToBuy = [];

        // Verificar stock y separar productos disponibles
        for (const item of cart.products) {
            const product = await this.productDAO.getById(item.product);
            if (!product) continue;

            if (product.stock < item.quantity) {
                productsOutOfStock.push(product);
            } else {
                product.stock -= item.quantity;
                await product.save();
                productsToBuy.push(item);
            }
        }

        if (productsToBuy.length === 0) {
            throw new Error("No hay productos disponibles para comprar");
        }

        // Calcular total
        const totalAmount = productsToBuy.reduce(
            (acc, item) => acc + item.quantity * (item.product?.price || 0),
            0
        );

        // Crear ticket usando DAO
        const ticket = await this.ticketDAO.create({
            user: userId,
            products: productsToBuy.map(item => ({
                product: item.product._id,
                quantity: item.quantity
            })),
            total: totalAmount
        });

        // Vaciar carrito de los productos comprados
        cart.products = cart.products.filter(item =>
            productsOutOfStock.some(p => p._id.toString() === item.product._id.toString())
        );
        await cart.save();

        return { ticket, productsOutOfStock };
    }
}
