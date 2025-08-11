import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('conectado a mongo');
    } catch (error) {
        console.error('error al conectar a mongo:', error);
        process.exit(1);
    }
};

export default connectDB;
