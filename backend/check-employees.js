import mysql from 'mysql2/promise';

// Configuración de la base de datos
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'hotelsol'
};

async function checkEmployees() {
  let connection;
  
  try {
    console.log('🔄 Conectando a la base de datos...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado a MySQL');

    // Mostrar empleados existentes
    console.log('\n👥 EMPLEADOS REGISTRADOS:');
    console.log('=========================');
    
    const [employees] = await connection.execute(`
      SELECT id, name, email, position, is_active, created_at 
      FROM employees 
      ORDER BY id ASC
    `);

    if (employees.length === 0) {
      console.log('📝 No hay empleados registrados');
    } else {
      employees.forEach(emp => {
        const status = emp.is_active ? '✅ Activo' : '❌ Inactivo';
        const createdDate = new Date(emp.created_at).toLocaleDateString('es-ES');
        console.log(`ID: ${emp.id} | ${emp.name} | ${emp.email} | ${emp.position} | ${status} | ${createdDate}`);
      });
    }

    console.log(`\n📊 Total: ${employees.length} empleados registrados`);
    console.log('\n¿Son estos empleados de ejemplo que quieres eliminar?');
    console.log('Si quieres eliminarlos, ejecuta el siguiente comando:');
    console.log('node backend/clear-all-employees.js');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔐 Conexión cerrada');
    }
  }
}

// Ejecutar verificación
checkEmployees().catch(console.error);