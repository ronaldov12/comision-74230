import User from "../models/User.js";

export default class UserDAO {
    async getAll() {
        return User.find().select('-password');
    }

    async getById(id) {
        return User.findById(id).select('-password');
    }

    async create(data) {
        const user = new User(data);
        return user.save();
    }

    async update(id, data) {
        return User.findByIdAndUpdate(id, data, { new: true }).select('-password');
    }

    async delete(id) {
        return User.findByIdAndDelete(id);
    }

    async findByEmail(email) {
        return User.findOne({ email });
    }
}
