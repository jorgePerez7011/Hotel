import pool from './config/mysql.js';

async function deleteAllIncomeData() {
  let connection;

  try {
    connection = await pool.getConnection();
    console.log('Iniciando eliminación de datos de ingresos...\n');

    // Obtener conteos antes de eliminar
    const [handoversBefore] = await connection.query('SELECT COUNT(*) as count FROM shift_handovers');
    const [bookingsBefore] = await connection.query('SELECT COUNT(*) as count FROM bookings');
    
    console.log('ANTES DE ELIMINAR:');
    console.log(`- Entregas de turno: ${handoversBefore[0].count} registros`);
    console.log(`- Reservas/Checkouts: ${bookingsBefore[0].count} registros\n`);

    // Eliminar entregas de turno
    console.log('Eliminando entregas de turno...');
    const [handoversResult] = await connection.query('DELETE FROM shift_handovers');
    console.log(`✓ ${handoversResult.affectedRows} entregas de turno eliminadas`);

    // Eliminar bookings
    console.log('Eliminando reservas/checkouts...');
    const [bookingsResult] = await connection.query('DELETE FROM bookings');
    console.log(`✓ ${bookingsResult.affectedRows} reservas/checkouts eliminados\n`);

    // Obtener conteos después de eliminar
    const [handoversAfter] = await connection.query('SELECT COUNT(*) as count FROM shift_handovers');
    const [bookingsAfter] = await connection.query('SELECT COUNT(*) as count FROM bookings');
    
    console.log('DESPUÉS DE ELIMINAR:');
    console.log(`- Entregas de turno: ${handoversAfter[0].count} registros`);
    console.log(`- Reservas/Checkouts: ${bookingsAfter[0].count} registros`);

    console.log('\n✓ Datos de ingresos eliminados correctamente');

  } catch (error) {
    console.error('Error al eliminar datos:', error);
  } finally {
    if (connection) connection.release();
  }
}

deleteAllIncomeData();
