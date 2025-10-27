import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.js';
import hotelRoutes from './routes/hotel.js';
import bookingRoutes from './routes/bookings.js';
import employeeRoutes from './routes/employees.js';
import handoverRoutes from './routes/handovers.js';

// Import database connections
import { connectMySQL } from './config/mysql.js';
import { connectMongoDB } from './config/mongodb.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(morgan('combined'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Hotel Sol Management API is running',
    timestamp: new Date().toISOString(),
    database: 'hotelsol (MySQL via XAMPP)',
    tech_stack: {
      backend: 'Node.js + Express',
      databases: ['MySQL (XAMPP)', 'MongoDB (opcional)'],
      frontend: 'Astro + Vue.js + Tailwind CSS'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/hotel', hotelRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/handovers', handoverRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: 'The requested endpoint does not exist'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  });
});

// Initialize database connections
const initializeDatabase = async () => {
  try {
    // Connect to MySQL (primary database)
    if (process.env.DB_TYPE === 'mysql' || process.env.DB_HOST) {
      try {
        await connectMySQL();
        console.log('✅ MySQL connected successfully to hotelsol database');
      } catch (mysqlError) {
        console.log('⚠️  MySQL connection failed:', mysqlError.message);
        console.log('⚠️  Make sure XAMPP MySQL is running and database "hotelsol" exists');
      }
    }
    
    // MongoDB is optional
    if (process.env.MONGODB_URI) {
      try {
        await connectMongoDB();
        console.log('✅ MongoDB connected successfully');
      } catch (mongoError) {
        console.log('⚠️  MongoDB connection failed, continuing with MySQL only');
      }
    }
  } catch (error) {
    console.log('⚠️  Database connections failed, running in demo mode');
  }
};

// Start server
const startServer = async () => {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log('🚀 Hotel Management System Backend');
      console.log('=====================================');
      console.log(`🌐 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
      console.log('=====================================');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;