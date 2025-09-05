// src/routers/password.router.js
import { Router } from "express";
import PasswordService from "../services/PasswordService.js";

const router = Router();
const passwordService = new PasswordService();

// Ruta para enviar email de recuperación
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        const result = await passwordService.generateResetToken(email);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Ruta para restablecer contraseña usando token
router.post("/reset-password/:token", async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;
        const result = await passwordService.resetPassword(token, newPassword);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
