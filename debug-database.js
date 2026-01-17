import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function debugDatabase() {
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

  const connection = await pool.getConnection();
  
  try {
    console.log('✓ Conexión a BD exitosa\n');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`Base de datos: ${process.env.DB_NAME}`);
    console.log(`Usuario: ${process.env.DB_USER}\n`);
    
    // Check users table
    console.log('═══════════════════════════════════════');
    console.log('TABLA: users');
    console.log('═══════════════════════════════════════');
    const [users] = await connection.execute('SELECT id, email, name, role, password FROM users');
    console.log(`Total de usuarios: ${users.length}`);
    if (users.length > 0) {
      users.forEach(user => {
        console.log(`- ${user.email} | Nombre: ${user.name} | Rol: ${user.role}`);
        console.log(`  Password hash: ${user.password.substring(0, 30)}...`);
      });
    }
    
    // Check employees table
    console.log('\n═══════════════════════════════════════');
    console.log('TABLA: employees');
    console.log('═══════════════════════════════════════');
    const [employees] = await connection.execute('SELECT id, email, name, position, password FROM employees');
    console.log(`Total de empleados: ${employees.length}`);
    if (employees.length > 0) {
      employees.forEach(emp => {
        console.log(`- ${emp.email} | Nombre: ${emp.name} | Posición: ${emp.position}`);
        console.log(`  Password hash: ${emp.password.substring(0, 30)}...`);
      });
    }
    
    console.log('\n✓ Debug completado');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    connection.release();
    await pool.end();
  }
}

debugDatabase();
