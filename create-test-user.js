import mysql from 'mysql2/promise';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const createTestUser = async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    const connection = await pool.getConnection();
    
    // Hash password
    const hashedPassword = await bcryptjs.hash('admin123', 10);
    
    // Insert test user
    await connection.execute(
      `INSERT INTO users (email, password, name, role) 
       VALUES (?, ?, ?, ?)`,
      ['admin@hotelsol.com', hashedPassword, 'Administrador', 'admin']
    );
    
    console.log('✅ Usuario de prueba creado:');
    console.log('Email: admin@hotelsol.com');
    console.log('Contraseña: admin123');
    
    connection.release();
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createTestUser();
