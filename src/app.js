import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import passport from 'passport';
import initializePassport from './config/passport.config.js';
import authRoutes from './routers/auth.router.js';
import sessionsRoutes from './routers/sessions.router.js';
import usersRoutes from './routers/users.router.js'; // Importamos rutas de usuarios

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Inicializamos Passport
initializePassport();
app.use(passport.initialize());

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => console.error('❌ Error al conectar a MongoDB:', err));

// Ruta raíz simple para probar que el servidor corre
app.get('/', (req, res) => {
    res.send('Bienvenido a la API de ecommerce');
});

// Usamos las rutas
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/users', usersRoutes);  
export default app;