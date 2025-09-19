import { Router } from "express";
import PasswordController from "../controllers/PasswordController.js";

const router = Router();
const passwordController = new PasswordController();

// Ruta para enviar email de recuperación
router.post("/forgot-password", passwordController.forgotPassword);

// Ruta para restablecer contraseña usando token
router.post("/reset-password/:token", passwordController.resetPassword);

export default router;
