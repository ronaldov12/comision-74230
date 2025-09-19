import SessionsService from "../services/SessionsService.js";
import UserDTO from "../dtos/UserDTO.js";

const sessionsService = new SessionsService();

export default class SessionsController {
    async register(req, res) {
        try {
            const userData = req.body;
            const newUser = await sessionsService.register(userData);

            res.status(201).json({
                message: "Usuario registrado con éxito",
                user: new UserDTO(newUser)
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const { user, token } = await sessionsService.login(email, password);

            res.json({
                message: "Login exitoso",
                user: new UserDTO(user),
                token
            });
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    }

    current(req, res) {
        const userDTO = new UserDTO(req.user);
        res.json({ user: userDTO });
    }
}
