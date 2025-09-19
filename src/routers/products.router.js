// Router: define rutas y llama al controller
import { Router } from "express";
import passport from "passport";
import { authorizeRoles } from "../middlewares/authorization.js";
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} from "../controllers/ProductController.js";

const router = Router();

//obtener todos los productos (público)
router.get("/", getAllProducts);

//crear producto (solo admin)
router.post("/", passport.authenticate("jwt", { session: false }), authorizeRoles("admin"), createProduct);

//obtener producto por id (publico)
router.get("/:id", getProductById);

//actualizar producto (solo admin)
router.put("/:id", passport.authenticate("jwt", { session: false }), authorizeRoles("admin"), updateProduct);

//eliminar producto (solo admin)
router.delete("/:id", passport.authenticate("jwt", { session: false }), authorizeRoles("admin"), deleteProduct);

export default router;
