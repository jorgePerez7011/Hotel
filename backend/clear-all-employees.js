import mysql from 'mysql2/promise';

// Configuración de la base de datos
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'hotelsol'
};

async function clearAllEmployees() {
  let connection;
  
  try {
    console.log('🔄 Conectando a la base de datos...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado a MySQL');

    // Mostrar empleados antes de eliminar
    console.log('\n👥 EMPLEADOS A ELIMINAR:');
    console.log('========================');
    
    const [employees] = await connection.execute(`
      SELECT id, name, email, position 
      FROM employees 
      ORDER BY id ASC
    `);

    employees.forEach(emp => {
      console.log(`🗑️  ID: ${emp.id} | ${emp.name} | ${emp.email} | ${emp.position}`);
    });

    console.log(`\n⚠️  Se eliminarán ${employees.length} empleados`);
    console.log('🔄 Iniciando eliminación...');

    // Eliminar todos los empleados
    const deleteResult = await connection.execute('DELETE FROM employees');
    console.log(`✅ ${deleteResult[0].affectedRows} empleados eliminados`);

    // Reiniciar AUTO_INCREMENT
    await connection.execute('ALTER TABLE employees AUTO_INCREMENT = 1');
    console.log('✅ Contador de empleados reiniciado');

    // Verificar eliminación
    const [remaining] = await connection.execute('SELECT COUNT(*) as count FROM employees');
    console.log(`📊 Empleados restantes: ${remaining[0].count}`);

    console.log('\n🎉 EMPLEADOS ELIMINADOS EXITOSAMENTE');
    console.log('===================================');
    console.log('✅ Todos los empleados de ejemplo eliminados');
    console.log('✅ Contador reiniciado desde ID 1');
    console.log('✅ Sistema listo para empleados reales');
    console.log('\n💡 Ahora puedes registrar empleados reales:');
    console.log('   • Ve al formulario de registro');
    console.log('   • Crea cuentas para tus empleados');
    console.log('   • Asigna roles apropiados (admin, recepcionista, aseadora, etc.)');

  } catch (error) {
    console.error('❌ Error eliminando empleados:', error.message);
    console.error('📍 Stack:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔐 Conexión cerrada');
    }
  }
}

// Ejecutar eliminación
clearAllEmployees().catch(console.error);