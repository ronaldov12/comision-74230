class CartDTO {
    constructor(cart) {
        this.products = cart.products.map(item => ({
            productId: item.product._id || item.product, 
            quantity: item.quantity
        }));
    }
}

export default CartDTO;
