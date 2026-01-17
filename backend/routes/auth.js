import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, isMongoDBConnected } from '../config/mongodb.js';
import pool from '../config/mysql.js';

const router = express.Router();

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'hotel-sol-secret-key-2025', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }
    req.user = user;
    next();
  });
}

// Register endpoint - REQUIRES AUTHENTICATION
router.post('/register', authenticateToken, async (req, res) => {
  try {
    const { email, password, name, role = 'guest' } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ 
        error: 'Email, password, and name are required' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    let user;
    
    // Try MongoDB first (only if connected), then MySQL
    if (isMongoDBConnected()) {
      try {
        // Check if user already exists in MongoDB
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(409).json({ error: 'User already exists' });
        }

        // Create user in MongoDB
        user = new User({
          email,
          password: hashedPassword,
          name,
          role
        });
        await user.save();
        
        console.log('User registered successfully in MongoDB');
      } catch (mongoError) {
        console.log('MongoDB registration failed, falling back to MySQL:', mongoError.message);
        // Fallback to MySQL
      }
    } else {
      console.log('MongoDB not connected, using MySQL for registration');
    }
    
    // If MongoDB wasn't used or failed, use MySQL
    if (!user || !user._id) {
      try {
        // Check if user already exists in MySQL
        const [existingUsers] = await pool.execute(
          'SELECT * FROM users WHERE email = ?',
          [email]
        );
        
        if (existingUsers.length > 0) {
          return res.status(409).json({ error: 'User already exists' });
        }

        // Create user in MySQL
        const [result] = await pool.execute(
          'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
          [email, hashedPassword, name, role]
        );
        
        // Get the created user
        const [newUser] = await pool.execute(
          'SELECT * FROM users WHERE id = ?',
          [result.insertId]
        );
        user = newUser[0];
        
      } catch (mysqlError) {
        throw new Error('Both database connections failed');
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id || user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id || user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed',
      message: error.message
    });
  }
});

// Login endpoint (updated for hotel employees)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email y contraseña son requeridos' 
      });
    }

    let user;
    
    // First check in employees table for hotel staff
    try {
      const [employees] = await pool.execute(
        'SELECT id, name, email, password, position, created_at FROM employees WHERE email = ?',
        [email]
      );
      
      if (employees.length > 0) {
        user = employees[0];
        user.role = user.position; // Use position as role for employees
        user.userType = 'employee';
      }
    } catch (mysqlError) {
      console.error('Employee lookup error:', mysqlError);
    }
    
    // If not found in employees, try general users table
    if (!user) {
      try {
        const [users] = await pool.execute(
          'SELECT * FROM users WHERE email = ?',
          [email]
        );
        if (users.length > 0) {
          user = users[0];
          user.userType = 'user';
        }
      } catch (mysqlError) {
        console.error('User lookup error:', mysqlError);
      }
    }

    // If still no user found, try MongoDB as fallback (only if connected)
    if (!user && isMongoDBConnected()) {
      try {
        user = await User.findOne({ email });
        if (user) {
          user.userType = 'mongo';
        }
      } catch (mongoError) {
        console.error('MongoDB lookup error:', mongoError);
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // For demo purposes, also allow plain text password comparison
    let isValidPassword = false;
    
    // Try bcrypt first
    try {
      isValidPassword = await bcrypt.compare(password, user.password);
    } catch (bcryptError) {
      // Fallback to plain text comparison for demo users
      isValidPassword = password === user.password;
    }
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Generate JWT token
    const tokenPayload = {
      id: user._id || user.id,
      email: user.email,
      name: user.name,
      position: user.position || user.role,
      userType: user.userType
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'hotel-sol-secret-key-2025',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      user: {
        id: user._id || user.id,
        email: user.email,
        name: user.name,
        position: user.position || user.role,
        role: user.position === 'recepcionista' || user.position === 'aseadora' ? 'staff' : 'admin',
        userType: user.userType
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    let user;
    
    // Try MongoDB first, then PostgreSQL
    try {
      user = await User.findById(req.user.userId).select('-password');
    } catch (mongoError) {
      // Fallback to MySQL
      try {
        const [result] = await pool.execute(
          'SELECT id, email, name, role, created_at FROM users WHERE id = ?',
          [req.user.userId]
        );
        user = result[0];
      } catch (mysqlError) {
        throw new Error('Database connection failed');
      }
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch profile',
      message: error.message
    });
  }
});

// Verify token endpoint
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// Debug endpoint to check users in database
router.get('/debug/users', async (req, res) => {
  try {
    const [users] = await pool.execute('SELECT id, email, name, role FROM users LIMIT 10');
    const [employees] = await pool.execute('SELECT id, email, name, position FROM employees LIMIT 10');
    
    res.json({
      status: 'success',
      users_table: users,
      employees_table: employees,
      total_users: users.length,
      total_employees: employees.length
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout exitoso'
  });
});

export default router;