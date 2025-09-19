import User from "../models/User.js";

export default class SessionsDAO {
    async getByEmail(email) {
        return User.findOne({ email });
    }
}

