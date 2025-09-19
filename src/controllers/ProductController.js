import ProductService from "../services/ProductService.js";

const productService = new ProductService();

// Obtener todos los productos (público)
export const getAllProducts = async (req, res) => {
    try {
        const products = await productService.getAllProducts();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Crear producto (solo admin)
export const createProduct = async (req, res) => {
    try {
        const product = await productService.createProduct(req.body);
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Obtener producto por id (público)
export const getProductById = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);
        res.json(product);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// Actualizar producto (solo admin)
export const updateProduct = async (req, res) => {
    try {
        const updated = await productService.updateProduct(req.params.id, req.body);
        res.json(updated);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// Eliminar producto (solo admin)
export const deleteProduct = async (req, res) => {
    try {
        await productService.deleteProduct(req.params.id);
        res.json({ message: "Producto eliminado" });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};
