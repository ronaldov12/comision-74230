import UserService from "../services/UserService.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendRecoveryEmail } from "../config/mailer.js";

const userService = new UserService();

// ADMIN / USUARIOS

export const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id, req.user);
        res.json(user);
    } catch (error) {
        if (error.message === "Acceso no autorizado") return res.status(403).json({ message: error.message });
        res.status(404).json({ message: error.message });
    }
};

export const createUser = async (req, res) => {
    try {
        await userService.createUser(req.body);
        res.status(201).json({ message: 'Usuario creado con éxito' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const updated = await userService.updateUser(req.params.id, req.body, req.user);
        res.json({ message: 'Usuario actualizado', user: updated });
    } catch (error) {
        if (error.message === "Acceso no autorizado") return res.status(403).json({ message: error.message });
        res.status(404).json({ message: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        await userService.deleteUser(req.params.id);
        res.json({ message: 'Usuario eliminado' });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// RECUPERACION DE CONTRASEÑA

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await userService.findByEmail(email);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        await sendRecoveryEmail(user, token);

        res.json({ message: 'Correo de recuperación enviado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al generar token', error: error.message });
    }
};

export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ message: 'Token y nueva contraseña son requeridos' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userService.getUserById(decoded.id, { role: 'admin', _id: decoded.id }); // bypass role

        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) return res.status(400).json({ message: 'La nueva contraseña no puede ser igual a la anterior' });

        user.password = bcrypt.hashSync(newPassword, 10);
        await user.save();

        res.json({ message: 'Contraseña restablecida correctamente' });
    } catch (error) {
        res.status(400).json({ message: 'Token inválido o expirado', error: error.message });
    }
};
