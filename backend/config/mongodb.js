import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel_management';

// Variable para rastrear el estado de la conexión
let isMongoConnected = false;

export const connectMongoDB = async () => {
  try {
    // Configurar opciones de conexión con timeouts más cortos
    const options = {
      serverSelectionTimeoutMS: 5000, // 5 segundos en lugar de 30
      connectTimeoutMS: 5000,
      socketTimeoutMS: 5000,
      maxPoolSize: 10,
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0 // Disable mongoose buffering
    };
    
    await mongoose.connect(MONGODB_URI, options);
    isMongoConnected = true;
    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    isMongoConnected = false;
    console.error('MongoDB connection error:', error.message);
    console.log('MongoDB will not be used, falling back to MySQL only');
    return false;
  }
};

// Función para verificar si MongoDB está conectado
export const isMongoDBConnected = () => {
  return isMongoConnected && mongoose.connection.readyState === 1;
};

// Función para cerrar la conexión de MongoDB
export const disconnectMongoDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      isMongoConnected = false;
      console.log('MongoDB disconnected successfully');
    }
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error.message);
  }
};

// Manejar eventos de conexión
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
  isMongoConnected = true;
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
  isMongoConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
  isMongoConnected = false;
});

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'staff', 'guest'],
    default: 'guest'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Room Schema
const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true,
    enum: ['single', 'double', 'suite', 'deluxe']
  },
  pricePerNight: {
    type: Number,
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  amenities: [{
    type: String
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Booking Schema
const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  checkInDate: {
    type: Date,
    required: true
  },
  checkOutDate: {
    type: Date,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Export models
export const User = mongoose.model('User', userSchema);
export const Room = mongoose.model('Room', roomSchema);
export const Booking = mongoose.model('Booking', bookingSchema);

export default mongoose;