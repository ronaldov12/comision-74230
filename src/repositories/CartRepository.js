import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

export default class CartRepository {
    // Obtiene el carrito del usuario o lo crea si no existe
    async getOrCreateCartByUser(userId) {
        let cart = await Cart.findOne({ user: userId }).populate('products.product');
        if (!cart) {
            cart = await Cart.create({ user: userId, products: [] });
        }
        return cart;
    }

    // Agregar producto al carrito del usuario
    async addProductToCart(userId, productId, quantity = 1) {
        if (!Number.isFinite(quantity) || quantity <= 0) {
            throw new Error('La cantidad debe ser un número positivo');
        }

        const product = await Product.findById(productId);
        if (!product) throw new Error(`Producto con id ${productId} no encontrado`);

        const cart = await this.getOrCreateCartByUser(userId);

        const idx = cart.products.findIndex(p => p.product.toString() === productId);
        if (idx > -1) {
            cart.products[idx].quantity += quantity;
        } else {
            cart.products.push({ product: productId, quantity });
        }

        await cart.save();
        return await cart.populate('products.product');
    }

    // Eliminar un producto del carrito del usuario
    async removeProductFromCart(userId, productId) {
        const cart = await this.getOrCreateCartByUser(userId);
        cart.products = cart.products.filter(p => p.product.toString() !== productId);
        await cart.save();
        return await cart.populate('products.product');
    }

    // Vaciar carrito del usuario
    async clearCart(userId) {
        const cart = await this.getOrCreateCartByUser(userId);
        cart.products = [];
        await cart.save();
        return cart;
    }

    //  Obtener carrito ya populado
    async getCartByUser(userId) {
        const cart = await Cart.findOne({ user: userId }).populate('products.product');
        if (!cart) throw new Error(`Carrito del usuario ${userId} no encontrado`);
        return cart;
    }
}
