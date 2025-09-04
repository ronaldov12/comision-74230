import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import passport from 'passport';
import initializePassport from './config/passport.config.js';

import authRoutes from './routers/auth.router.js';
import sessionsRoutes from './routers/sessions.router.js';
import usersRoutes from './routers/users.router.js';
import productsRouter from './routers/products.router.js';
import ticketsRouter from './routers/tickets.router.js'; 
import cartsRouter from './routers/cart.router.js';

dotenv.config();

const app = express();

// Middlewares para parsear JSON y URL-encoded
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

// Ruta raíz simple
app.get('/', (req, res) => {
    res.send('Bienvenido a la API de ecommerce');
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/products', productsRouter);
app.use('/api/t', ticketsRouter); 
app.use('/api/carts', cartsRouter);

export default app;
