import Cart from "../models/Cart.js";

export default class CartDAO {
    async getOrCreateCartByUser(userId) {
        let cart = await Cart.findOne({ user: userId }).populate("products.product");
        if (!cart) {
            cart = new Cart({ user: userId, products: [] });
            await cart.save();
        }
        return cart;
    }

    async addProductToCart(userId, productId, quantity) {
        const cart = await this.getOrCreateCartByUser(userId);
        const existing = cart.products.find(p => {
            const pid = p.product?._id?.toString() || p.product?.toString();
            return pid === productId;
        });
        if (existing) {
            existing.quantity += quantity;
        } else {
            cart.products.push({ product: productId, quantity });
        }

        await cart.save();
        return cart.populate("products.product");
    }

    async removeProductFromCart(userId, productId) {
        const cart = await this.getOrCreateCartByUser(userId);
        cart.products = cart.products.filter(p => p.product.toString() !== productId);
        await cart.save();
        return cart.populate("products.product");
    }

    async clearCart(userId) {
        const cart = await this.getOrCreateCartByUser(userId);
        cart.products = [];
        await cart.save();
        return cart;
    }
}
