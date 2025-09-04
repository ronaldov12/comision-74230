// src/repositories/UserRepository.js
import User from '../models/User.js';

export default class UserRepository {
    // Obtener todos los usuarios
    async getAllUsers() {
        return await User.find().select('-password'); // DTO simple: ocultamos password
    }

    // Obtener usuario por ID
    async getUserById(id) {
        const user = await User.findById(id).select('-password');
        if(!user) throw new Error(`Usuario con id ${id} no encontrado`);
        return user;
    }

    // Crear nuevo usuario
    async createUser(userData) {
        const exist = await User.findOne({ email: userData.email });
        if(exist) throw new Error('El usuario ya existe');
        const newUser = await User.create(userData);
        return newUser;
    }

    // Actualizar usuario
    async updateUser(id, updates) {
        const updated = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
        if(!updated) throw new Error(`Usuario con id ${id} no encontrado`);
        return updated;
    }

    // Eliminar usuario
    async deleteUser(id) {
        const deleted = await User.findByIdAndDelete(id);
        if(!deleted) throw new Error(`Usuario con id ${id} no encontrado`);
        return deleted;
    }
}
