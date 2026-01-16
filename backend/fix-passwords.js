import pool from './config/mysql.js';
import bcrypt from 'bcryptjs';

async function fixEmployeePasswords() {
  try {
    console.log('🔧 Arreglando contraseñas de empleados...\n');
    
    const newPassword = '123456';
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update all employees to have hashed password "123456"
    const [result] = await pool.execute(
      'UPDATE employees SET password = ? WHERE email IN (?, ?, ?, ?)',
      [hashedPassword, 'admin@hotelsol.com', 'manager@hotelsol.com', 'staff@hotelsol.com', 'guest@hotelsol.com']
    );
    
    console.log(`✅ Actualizadas ${result.affectedRows} contraseñas de empleados`);
    
    // Verify the changes
    const [employees] = await pool.execute('SELECT email, password FROM employees');
    console.log('\n📋 Empleados actualizados:');
    for (const emp of employees) {
      const isValidPassword = await bcrypt.compare(newPassword, emp.password);
      console.log(`  • ${emp.email}: ${isValidPassword ? '✅ Contraseña correcta' : '❌ Contraseña incorrecta'}`);
    }
    
    await pool.end();
    console.log('\n🎉 ¡Contraseñas arregladas! Ahora puedes usar "123456" para todos los usuarios.');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixEmployeePasswords();