import mysql from 'mysql2/promise';

// Configuración de la base de datos
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'hotelsol'
};

async function clearSampleData() {
  let connection;
  
  try {
    console.log('🔄 Conectando a la base de datos...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado a MySQL');

    // Verificar datos existentes antes de limpiar
    console.log('\n📋 Verificando datos existentes...');
    
    const [handovers] = await connection.execute('SELECT COUNT(*) as count FROM shift_handovers');
    const [transactions] = await connection.execute('SELECT COUNT(*) as count FROM shift_transactions');
    const [employees] = await connection.execute('SELECT COUNT(*) as count FROM employees');
    const [bookings] = await connection.execute('SELECT COUNT(*) as count FROM bookings');
    
    console.log(`📊 Entregas de turno existentes: ${handovers[0].count}`);
    console.log(`💰 Transacciones existentes: ${transactions[0].count}`);
    console.log(`👥 Empleados existentes: ${employees[0].count}`);
    console.log(`🏨 Reservas existentes: ${bookings[0].count}`);

    // Confirmar eliminación
    console.log('\n⚠️  ATENCIÓN: Se eliminarán TODOS los datos de ejemplo');
    console.log('🔄 Iniciando limpieza...');

    // 1. Eliminar todas las transacciones de ejemplo
    console.log('🗑️  Eliminando transacciones...');
    const deleteTransactions = await connection.execute('DELETE FROM shift_transactions');
    console.log(`✅ ${deleteTransactions[0].affectedRows} transacciones eliminadas`);

    // 2. Eliminar todas las entregas de turno de ejemplo
    console.log('🗑️  Eliminando entregas de turno...');
    const deleteHandovers = await connection.execute('DELETE FROM shift_handovers');
    console.log(`✅ ${deleteHandovers[0].affectedRows} entregas de turno eliminadas`);

    // 3. Eliminar todas las reservas de ejemplo
    console.log('🗑️  Eliminando reservas...');
    const deleteBookings = await connection.execute('DELETE FROM bookings');
    console.log(`✅ ${deleteBookings[0].affectedRows} reservas eliminadas`);

    // 3. Eliminar empleados de ejemplo (opcional - descomenta si quieres eliminarlos)
    /*
    console.log('🗑️  Eliminando empleados de ejemplo...');
    const deleteEmployees = await connection.execute('DELETE FROM employees');
    console.log(`✅ ${deleteEmployees[0].affectedRows} empleados eliminados`);
    */

    // 4. Reiniciar AUTO_INCREMENT para empezar desde 1
    console.log('🔄 Reiniciando contadores...');
    await connection.execute('ALTER TABLE shift_handovers AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE shift_transactions AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE bookings AUTO_INCREMENT = 1');
    // await connection.execute('ALTER TABLE employees AUTO_INCREMENT = 1'); // Descomenta si eliminaste empleados

    console.log('✅ Contadores reiniciados');

    // 5. Verificar limpieza
    console.log('\n🔍 Verificando limpieza...');
    
    const [handoversAfter] = await connection.execute('SELECT COUNT(*) as count FROM shift_handovers');
    const [transactionsAfter] = await connection.execute('SELECT COUNT(*) as count FROM shift_transactions');
    const [employeesAfter] = await connection.execute('SELECT COUNT(*) as count FROM employees');
    const [bookingsAfter] = await connection.execute('SELECT COUNT(*) as count FROM bookings');
    
    console.log(`📊 Entregas de turno restantes: ${handoversAfter[0].count}`);
    console.log(`💰 Transacciones restantes: ${transactionsAfter[0].count}`);
    console.log(`👥 Empleados restantes: ${employeesAfter[0].count}`);
    console.log(`🏨 Reservas restantes: ${bookingsAfter[0].count}`);

    // 6. Mostrar estructura limpia de las tablas
    console.log('\n📋 Estructura de tablas mantenida:');
    
    const [handoverColumns] = await connection.execute('DESCRIBE shift_handovers');
    console.log(`✅ Tabla shift_handovers: ${handoverColumns.length} campos`);
    
    const [transactionColumns] = await connection.execute('DESCRIBE shift_transactions');
    console.log(`✅ Tabla shift_transactions: ${transactionColumns.length} campos`);

    const [bookingColumns] = await connection.execute('DESCRIBE bookings');
    console.log(`✅ Tabla bookings: ${bookingColumns.length} campos`);

    console.log('\n🎉 LIMPIEZA COMPLETADA EXITOSAMENTE');
    console.log('=====================================');
    console.log('✅ Todos los datos de ejemplo eliminados');
    console.log('✅ Estructura de base de datos mantenida');
    console.log('✅ Campos financieros preservados');
    console.log('✅ Sistema listo para datos reales');
    console.log('\n💡 Ahora puedes empezar a registrar:');
    console.log('   • Empleados reales del hotel');
    console.log('   • Entregas de turno reales');
    console.log('   • Transacciones financieras reales');

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error.message);
    console.error('📍 Stack:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔐 Conexión cerrada');
    }
  }
}

// Ejecutar la limpieza
clearSampleData().catch(console.error);