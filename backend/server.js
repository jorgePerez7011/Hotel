import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import authRoutes from './routes/auth.js';
import hotelRoutes from './routes/hotel.js';
import bookingRoutes from './routes/bookings.js';
import employeeRoutes from './routes/employees.js';
import handoverRoutes from './routes/handovers.js';
import reportsRoutes from './routes/reports.js';
import companiesRoutes from './routes/companies.js';
import invoicesRoutes from './routes/invoices.js';
import inventoryRoutes from './routes/inventory.js';

// Import database connections
import { connectMySQL } from './config/mysql.js';
import { connectMongoDB } from './config/mongodb.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:", "http:"],
      fontSrc: ["'self'", "data:", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com"]
    }
  }
}));
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://hotelsol.watersol.co',
    process.env.FRONTEND_URL,
    process.env.CORS_ORIGIN
  ].filter(Boolean),
  credentials: true
}));

// Rate limiting - more generous for production
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 500 : 100, // 500 req/15min in production, 100 in dev
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => {
    // Skip rate limiting for static files
    return req.path.startsWith('/Fotos') || req.path.startsWith('/_astro') || req.path.endsWith('.js') || req.path.endsWith('.css');
  }
});

// Apply rate limiting only to API routes
app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(morgan('combined'));

// Servir archivos estáticos públicos
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

// Servir archivos estáticos de Astro
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Servir carpeta de fotos
const fotosPath = path.join(__dirname, '..', 'Fotos');
app.use('/Fotos', express.static(fotosPath));

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

// Debug database endpoint
app.get('/api/debug/db', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Test query
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const [employees] = await connection.execute('SELECT COUNT(*) as count FROM employees');
    
    connection.release();
    
    res.json({
      status: 'Conectado',
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      users_count: users[0].count,
      employees_count: employees[0].count
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      error: error.message,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/hotel', hotelRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/handovers', handoverRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/inventory', inventoryRoutes);

// SPA fallback - sirve index.html para rutas no encontradas
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});
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
      const mongoSuccess = await connectMongoDB();
      if (mongoSuccess) {
        console.log('✅ MongoDB connected successfully');
      } else {
        console.log('⚠️  MongoDB connection failed, continuing with MySQL only');
      }
    } else {
      console.log('ℹ️  MongoDB URI not configured, using MySQL only');
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