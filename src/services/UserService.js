import UserDAO from "../dao/user.dao.js";
import bcrypt from "bcrypt";

export default class UserService {
    constructor() {
        this.userDAO = new UserDAO();
    }

    async getAllUsers() {
        return this.userDAO.getAll();
    }

    async getUserById(id, requester) {
        const user = await this.userDAO.getById(id);
        if (!user) throw new Error("Usuario no encontrado");

        // Validación de acceso: admin o propio usuario
        if (requester.role !== "admin" && requester._id.toString() !== id) {
            throw new Error("Acceso no autorizado");
        }

        return user;
    }

    async createUser(data) {
        const exist = await this.userDAO.findByEmail(data.email);
        if (exist) throw new Error("El usuario ya existe");

        data.password = bcrypt.hashSync(data.password, 10);
        data.role = data.role || "user";
        return this.userDAO.create(data);
    }

    async updateUser(id, updates, requester) {
        // Validación de acceso: admin o propio usuario
        if (requester.role !== "admin" && requester._id.toString() !== id) {
            throw new Error("Acceso no autorizado");
        }

        if (updates.password) {
            updates.password = bcrypt.hashSync(updates.password, 10);
        }

        const updated = await this.userDAO.update(id, updates);
        if (!updated) throw new Error("Usuario no encontrado");
        return updated;
    }

    async deleteUser(id) {
        const deleted = await this.userDAO.delete(id);
        if (!deleted) throw new Error("Usuario no encontrado");
        return deleted;
    }

    async findByEmail(email) {
        return this.userDAO.findByEmail(email);
    }
}
