import CartService from "../services/CartService.js";

const cartService = new CartService();

// Obtener el carrito del usuario logueado
export const getMyCart = async (req, res) => {
    try {
        const cart = await cartService.getOrCreateCartByUser(req.user._id);
        res.json(cart);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const addProduct = async (req, res) => {
    try {
        const { pid } = req.params;
        const quantity = Number(req.body.quantity) || 1;
        const updatedCart = await cartService.addProductToCart(req.user._id, pid, quantity);

        res.status(200).json({
            message: 'Producto agregado al carrito',
            cart: updatedCart,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const removeProduct = async (req, res) => {
    try {
        const { pid } = req.params;
        const cart = await cartService.removeProductFromCart(req.user._id, pid);
        res.json({ message: 'Producto eliminado del carrito', cart });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const clearCart = async (req, res) => {
    try {
        const cart = await cartService.clearCart(req.user._id);
        res.json({ message: 'Carrito vaciado', cart });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const purchaseCart = async (req, res) => {
    try {
        const { productsInStock, productsOutOfStock, cartId } = await cartService.verifyStock(req.user._id);

        if (productsOutOfStock.length > 0) {
            return res.status(400).json({
                message: 'Algunos productos no tienen stock suficiente',
                productsOutOfStock
            });
        }

        await cartService.reduceStock(productsInStock);
        await cartService.clearCart(req.user._id);

        res.status(200).json({
            message: 'Compra realizada con éxito',
            cartId,
            productsPurchased: productsInStock
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
