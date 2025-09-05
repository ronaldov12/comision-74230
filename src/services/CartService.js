//! lógica de negocio
import Product from "../models/Product.js";
import CartRepository from "../repositories/CartRepository.js";

export default class CartService {
    constructor() {
        this.cartRepo = new CartRepository();
    }

    // verificar stock antes de la compra
    async verifyStock(userId) {
        const cart = await this.cartRepo.getCartByUser(userId);
        const productsInStock = [];
        const productsOutOfStock = [];

        for (const item of cart.products) {
            const product = item.product;
            if (product.stock >= item.quantity) {
                productsInStock.push(item);
            } else {
                productsOutOfStock.push({
                    productId: product._id,
                    requested: item.quantity,
                    available: product.stock
                });
            }
        }

        return {
            cartId: cart._id,
            productsInStock,
            productsOutOfStock
        };
    }

    // reducir stock después de compra exitosa
    async reduceStock(products) {
        for (const item of products) {
            await Product.findByIdAndUpdate(item.product._id, {
                $inc: { stock: -item.quantity }
            });
        }
    }

    // vaciar carrito
    async clearCart(userId) {
        return await this.cartRepo.clearCart(userId);
    }
}
