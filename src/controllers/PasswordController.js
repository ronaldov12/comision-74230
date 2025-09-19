import PasswordService from "../services/PasswordService.js";

export default class PasswordController {
    constructor() {
        this.passwordService = new PasswordService();
    }

    // enviar correo de recuperacion
    forgotPassword = async (req, res) => {
        try {
            const { email } = req.body;
            const result = await this.passwordService.generateResetToken(email);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    //restablecer contraseña usando token
    resetPassword = async (req, res) => {
        try {
            const { token } = req.params;
            const { newPassword } = req.body;
            const result = await this.passwordService.resetPassword(token, newPassword);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}
