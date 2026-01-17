import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Create connection to Hostinger database
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function createTestUsers() {
  const connection = await pool.getConnection();
  
  try {
    console.log('Conectando a la base de datos...');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`Base de datos: ${process.env.DB_NAME}`);
    
    // Hash passwords
    const hashedPassword = await bcrypt.hash('123456', 12);
    
    // Clear existing test users
    console.log('\nEliminando usuarios de prueba existentes...');
    await connection.execute('DELETE FROM users WHERE email LIKE ?', ['%@test.com']);
    await connection.execute('DELETE FROM employees WHERE email LIKE ?', ['%@test.com']);
    
    // Create test users
    console.log('\nCreando usuarios de prueba en la tabla "users"...');
    await connection.execute(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      ['admin@test.com', hashedPassword, 'Admin User', 'admin']
    );
    console.log('✓ admin@test.com creado');
    
    await connection.execute(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      ['user@test.com', hashedPassword, 'Test User', 'guest']
    );
    console.log('✓ user@test.com creado');
    
    // Create test employees
    console.log('\nCreando empleados de prueba en la tabla "employees"...');
    await connection.execute(
      'INSERT INTO employees (name, email, password, position) VALUES (?, ?, ?, ?)',
      ['Juan Recepcionista', 'recepcionista@test.com', hashedPassword, 'recepcionista']
    );
    console.log('✓ recepcionista@test.com creado');
    
    await connection.execute(
      'INSERT INTO employees (name, email, password, position) VALUES (?, ?, ?, ?)',
      ['María Aseadora', 'aseadora@test.com', hashedPassword, 'aseadora']
    );
    console.log('✓ aseadora@test.com creado');
    
    console.log('\n✅ Usuarios de prueba creados exitosamente');
    console.log('\nCredenciales para probar:');
    console.log('═══════════════════════════════════════');
    console.log('Email: admin@test.com');
    console.log('Contraseña: 123456');
    console.log('───────────────────────────────────────');
    console.log('Email: recepcionista@test.com');
    console.log('Contraseña: 123456');
    console.log('═══════════════════════════════════════');
    
  } catch (error) {
    console.error('Error al crear usuarios:', error.message);
    process.exit(1);
  } finally {
    connection.release();
    await pool.end();
  }
}

createTestUsers();
