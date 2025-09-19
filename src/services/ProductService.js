// logica de negocio
import ProductDAO from "../dao/product.dao.js";

export default class ProductService {
    constructor() {
        this.productDAO = new ProductDAO();
    }

    async getAllProducts() {
        return this.productDAO.getAll(); // obtener todos los productos
    }

    async getProductById(id) {
        const product = await this.productDAO.getById(id); // obtener producto por id
        if (!product) throw new Error("Producto no encontrado");
        return product;
    }

    async createProduct(data) {
        return this.productDAO.create(data); // crear nuevo producto
    }

    async updateProduct(id, data) {
        const updated = await this.productDAO.update(id, data); // actualizar producto
        if (!updated) throw new Error("Producto no encontrado");
        return updated;
    }

    async deleteProduct(id) {
        const deleted = await this.productDAO.delete(id); // eliminar producto
        if (!deleted) throw new Error("Producto no encontrado");
        return deleted;
    }

    // Reducir stock de un producto
    async reduceStock(productId, quantity) {
        const product = await this.productDAO.getById(productId); // obtener producto
        if (!product) throw new Error("Producto no encontrado");
        if (product.stock < quantity) throw new Error("Stock insuficiente"); // validar stock
        product.stock -= quantity; // restar cantidad del stock
        return this.productDAO.update(productId, product); // actualizar producto
    }
}
