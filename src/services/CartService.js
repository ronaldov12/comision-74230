//logica de negocio y validaciones
import CartDAO from "../dao/cart.dao.js";
import ProductService from "./ProductService.js"; 

export default class CartService {
    constructor() {
        this.cartDAO = new CartDAO();
        this.productService = new ProductService();
    }

    async getOrCreateCartByUser(userId) {
        return this.cartDAO.getOrCreateCartByUser(userId);
    }

    async addProductToCart(userId, productId, quantity) {
        return this.cartDAO.addProductToCart(userId, productId, quantity);
    }

    async removeProductFromCart(userId, productId) {
        return this.cartDAO.removeProductFromCart(userId, productId);
    }

    async clearCart(userId) {
        return this.cartDAO.clearCart(userId);
    }

    // verificar stock antes de comprar
    async verifyStock(userId) {
        const cart = await this.cartDAO.getOrCreateCartByUser(userId);
        const productsInStock = [];
        const productsOutOfStock = [];

        for (const item of cart.products) {
            const product = await this.productService.getProductById(item.product._id);
            if (product.stock >= item.quantity) {
                productsInStock.push(item);
            } else {
                productsOutOfStock.push(item);
            }
        }

        return {
            productsInStock,
            productsOutOfStock,
            cartId: cart._id
        };
    }

    async reduceStock(products) {
        for (const item of products) {
            await this.productService.reduceStock(item.product._id, item.quantity);
        }
    }
}
