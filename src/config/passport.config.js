import passport from 'passport';
import local from 'passport-local';
import jwt from 'passport-jwt';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

const LocalStrategy = local.Strategy;
const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;

// Inicializa estrategias de Passport
export default function initializePassport() {
    // Estrategia Local para login con email y contraseña
    passport.use('login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, async (email, password, done) => {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return done(null, false, { message: 'Usuario no encontrado' });
            }
            // Compara contraseña con hash almacenado
            const isValid = bcrypt.compareSync(password, user.password);
            if (!isValid) {
                return done(null, false, { message: 'Contraseña incorrecta' });
            }
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }));

    // Estrategia JWT para rutas protegidas
    passport.use('jwt', new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET
    }, async (jwtPayload, done) => {
        try {
            const user = await User.findById(jwtPayload.id);
            if (!user) {
                return done(null, false, { message: 'Token inválido' });
            }
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }));
}
