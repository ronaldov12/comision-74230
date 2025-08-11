// src/middlewares/authorizeRoles.js
export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: 'No autorizado: usuario no autenticado' });
        }

        if (!allowedRoles.includes(user.role)) {
            return res.status(401).json({ message: 'Acceso denegado: rol insuficiente' });
        }

        next();
    };
};
