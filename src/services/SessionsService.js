import SessionsDAO from "../dao/session.dao.js"; 
import UserDAO from "../dao/user.dao.js";        
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export default class SessionsService {
    constructor() {
        this.dao = new SessionsDAO(); // usar la clase correcta
        this.userDAO = new UserDAO();
    }

    async register(userData) {
        const { email, password } = userData;

        // verificar si ya existe
        const existingUser = await this.userDAO.findByEmail(email);
        if (existingUser) throw new Error("El usuario ya existe");

        // hashear contraseña
        const hashedPassword = bcrypt.hashSync(password, 10);

        // crear usuario
        const newUser = await this.userDAO.create({
            ...userData,
            password: hashedPassword
        });

        return newUser;
    }

    async login(email, password) {
        const user = await this.dao.getByEmail(email);
        if (!user) throw new Error("Usuario no encontrado");

        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword) throw new Error("Contraseña incorrecta");

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        return { user, token };
    }
}
