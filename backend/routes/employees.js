import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
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

// Get all employees
router.get('/', async (req, res) => {
  try {
    const [employees] = await pool.execute(`
      SELECT id, name, email, phone, position, salary, hire_date, shift, emergency_contact, address, is_active, created_at 
      FROM employees 
      ORDER BY position, name
    `);

    res.json({ 
      employees,
      total: employees.length,
      positions: {
        aseadoras: employees.filter(emp => emp.position === 'aseadora').length,
        recepcionistas: employees.filter(emp => emp.position === 'recepcionista').length
      }
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ 
      error: 'Failed to fetch employees',
      message: error.message
    });
  }
});

// Get employees by position
router.get('/position/:position', async (req, res) => {
  try {
    const { position } = req.params;
    
    // Validate position
    if (!['aseadora', 'recepcionista'].includes(position)) {
      return res.status(400).json({ 
        error: 'Invalid position. Must be "aseadora" or "recepcionista"' 
      });
    }

    const [employees] = await pool.execute(
      'SELECT * FROM employees WHERE position = ? AND is_active = true ORDER BY name',
      [position]
    );

    res.json({ employees });
  } catch (error) {
    console.error('Error fetching employees by position:', error);
    res.status(500).json({ 
      error: 'Failed to fetch employees',
      message: error.message
    });
  }
});

// Get employee by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [employees] = await pool.execute(
      'SELECT * FROM employees WHERE id = ?',
      [id]
    );

    if (employees.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ employee: employees[0] });
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ 
      error: 'Failed to fetch employee',
      message: error.message
    });
  }
});

// Create new employee - REQUIRES AUTHENTICATION
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password,
      phone, 
      position, 
      salary, 
      hire_date,
      shift = 'mañana',
      emergency_contact,
      address
    } = req.body;

    // Validate required fields
    if (!name || !email || !position || !password) {
      return res.status(400).json({ 
        error: 'Name, email, position, and password are required' 
      });
    }

    // Validate position
    if (!['admin', 'aseadora', 'recepcionista'].includes(position)) {
      return res.status(400).json({ 
        error: 'Position must be "admin", "aseadora" or "recepcionista"' 
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Check if email already exists
    const [existingEmployee] = await pool.execute(
      'SELECT id FROM employees WHERE email = ?',
      [email]
    );

    if (existingEmployee.length > 0) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new employee
    const [result] = await pool.execute(`
      INSERT INTO employees 
      (name, email, password, phone, position, salary, hire_date, shift, emergency_contact, address) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, email, hashedPassword, phone, position, salary, hire_date || new Date().toISOString().split('T')[0], shift, emergency_contact, address]);

    // Get the created employee (without password)
    const [newEmployee] = await pool.execute(
      'SELECT id, name, email, phone, position, salary, hire_date, shift, emergency_contact, address, is_active, created_at FROM employees WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Employee created successfully',
      employee: newEmployee[0]
    });

  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ 
      error: 'Failed to create employee',
      message: error.message
    });
  }
});

// Update employee
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      email, 
      phone, 
      position, 
      salary, 
      shift,
      emergency_contact,
      address,
      is_active
    } = req.body;

    // Validate position if provided
    if (position && !['aseadora', 'recepcionista'].includes(position)) {
      return res.status(400).json({ 
        error: 'Position must be "aseadora" or "recepcionista"' 
      });
    }

    // Check if employee exists
    const [existingEmployee] = await pool.execute(
      'SELECT * FROM employees WHERE id = ?',
      [id]
    );

    if (existingEmployee.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Convert undefined to null for SQL parameters
    const params = [name, email, phone, position, salary, shift, emergency_contact, address, is_active].map(
      value => value === undefined ? null : value
    );

    // Update employee
    const [result] = await pool.execute(`
      UPDATE employees 
      SET name = COALESCE(?, name),
          email = COALESCE(?, email),
          phone = COALESCE(?, phone),
          position = COALESCE(?, position),
          salary = COALESCE(?, salary),
          shift = COALESCE(?, shift),
          emergency_contact = COALESCE(?, emergency_contact),
          address = COALESCE(?, address),
          is_active = COALESCE(?, is_active)
      WHERE id = ?
    `, [...params, id]);

    // Get the updated employee
    const [updatedEmployee] = await pool.execute(
      'SELECT * FROM employees WHERE id = ?',
      [id]
    );

    res.json({
      message: 'Employee updated successfully',
      employee: updatedEmployee[0]
    });

  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ 
      error: 'Failed to update employee',
      message: error.message
    });
  }
});

// Delete employee (hard delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if employee exists
    const [existingEmployee] = await pool.execute(
      'SELECT * FROM employees WHERE id = ?',
      [id]
    );

    if (existingEmployee.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Hard delete employee
    await pool.execute(
      'DELETE FROM employees WHERE id = ?',
      [id]
    );

    res.json({
      message: 'Employee deleted successfully',
      employee_id: id
    });

  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ 
      error: 'Failed to delete employee',
      message: error.message
    });
  }
});

// Get employee statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        position,
        COUNT(*) as total,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active,
        AVG(salary) as avg_salary,
        MIN(hire_date) as earliest_hire,
        MAX(hire_date) as latest_hire
      FROM employees 
      GROUP BY position
    `);

    const [totalStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_employees,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_employees,
        COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_employees,
        AVG(salary) as overall_avg_salary
      FROM employees
    `);

    res.json({
      by_position: stats,
      overall: totalStats[0]
    });

  } catch (error) {
    console.error('Error fetching employee stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
});

export default router;