import Product from '../models/Product.js';

class ProductRepository {
    async addProduct(product) {
        try {
            const newProduct = await Product.create(product);
            return newProduct;
        } catch (error) {
            console.error('Error al agregar producto:', error.message);
            throw error;
        }
    }

    async getProducts() {
        return await Product.find();
    }

    async getProductById(id) {
        const product = await Product.findById(id);
        if(!product) throw new Error(`Producto con id ${id} no encontrado`);
        return product;
    }

    async updateProduct(id, updates) {
        const updated = await Product.findByIdAndUpdate(id, updates, { new: true });
        if(!updated) throw new Error(`Producto con id ${id} no encontrado`);
        return updated;
    }

    async deleteProduct(id) {
        const deleted = await Product.findByIdAndDelete(id);
        if(!deleted) throw new Error(`Producto con id ${id} no encontrado`);
        return deleted;
    }
}

export default ProductRepository;
