import User from "../models/User.js";

export default class PasswordDAO {
    // Buscar usuario por email
    async findUserByEmail(email) {
        return User.findOne({ email });
    }

    // Actualizar contraseña de un usuario
    async updatePassword(userId, newPassword) {
        return User.findByIdAndUpdate(
            userId,
            { password: newPassword },
            { new: true }
        );
    }
}
