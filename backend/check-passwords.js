import pool from './config/mysql.js';
import bcrypt from 'bcryptjs';

async function checkPasswords() {
  try {
    console.log('🔍 Verificando contraseñas en la base de datos...\n');
    
    // Check users table
    const [users] = await pool.execute('SELECT email, password FROM users WHERE email = ?', ['admin@hotelsol.com']);
    if (users.length > 0) {
      console.log('👤 Usuario encontrado en tabla users:');
      console.log('Email:', users[0].email);
      console.log('Password hash:', users[0].password);
      console.log('Es hash bcrypt:', users[0].password.startsWith('$2'));
      
      // Test password comparison
      const testPassword = '123456';
      const isValidBcrypt = await bcrypt.compare(testPassword, users[0].password);
      const isValidPlain = testPassword === users[0].password;
      
      console.log('Password "123456" con bcrypt:', isValidBcrypt);
      console.log('Password "123456" texto plano:', isValidPlain);
      console.log('');
    } else {
      console.log('❌ No se encontró usuario admin@hotelsol.com en tabla users\n');
    }
    
    // Check employees table
    const [employees] = await pool.execute('SELECT email, password FROM employees WHERE email = ?', ['admin@hotelsol.com']);
    if (employees.length > 0) {
      console.log('👨‍💼 Empleado encontrado en tabla employees:');
      console.log('Email:', employees[0].email);
      console.log('Password hash:', employees[0].password);
      console.log('Es hash bcrypt:', employees[0].password.startsWith('$2'));
      
      // Test password comparison
      const testPassword = '123456';
      const isValidBcrypt = await bcrypt.compare(testPassword, employees[0].password);
      const isValidPlain = testPassword === employees[0].password;
      
      console.log('Password "123456" con bcrypt:', isValidBcrypt);
      console.log('Password "123456" texto plano:', isValidPlain);
    } else {
      console.log('❌ No se encontró empleado admin@hotelsol.com en tabla employees');
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkPasswords();