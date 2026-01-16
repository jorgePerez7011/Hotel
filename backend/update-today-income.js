import mysql from 'mysql2/promise';

// Configuración de la base de datos
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'hotelsol'
};

async function updateTodayIncome() {
  let connection;

  try {
    console.log('🔄 Conectando a la base de datos...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado a MySQL');

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    console.log(`📅 Procesando reservas para hoy: ${today}`);

    // 1. Obtener todas las reservas de hoy
    const [bookings] = await connection.execute(`
      SELECT id, guest_name, total_amount, status, check_in_date
      FROM bookings
      WHERE check_in_date = ? AND status IN ('confirmed', 'checked_in')
    `, [today]);

    console.log(`📊 Reservas encontradas para hoy: ${bookings.length}`);

    if (bookings.length === 0) {
      console.log('ℹ️ No hay reservas para hoy. No se actualiza nada.');
      return;
    }

    // 2. Calcular el total de ingresos de hoy
    const totalIncome = bookings.reduce((sum, booking) => sum + parseFloat(booking.total_amount), 0);
    console.log(`💰 Total de ingresos calculados de reservas de hoy: $${totalIncome.toFixed(2)}`);

    // 3. Buscar si ya existe una entrega de turno para hoy
    const [existingHandover] = await connection.execute(`
      SELECT id, total_income
      FROM shift_handovers
      WHERE shift_date = ?
      ORDER BY handover_time DESC
      LIMIT 1
    `, [today]);

    let handoverId;

    if (existingHandover.length > 0) {
      handoverId = existingHandover[0].id;
      console.log(`✅ Entrega de turno existente encontrada (ID: ${handoverId})`);

      // Actualizar el total_income sumando el nuevo ingreso
      const currentIncome = parseFloat(existingHandover[0].total_income) || 0;
      const newTotalIncome = currentIncome + totalIncome;

      await connection.execute(`
        UPDATE shift_handovers
        SET total_income = ?
        WHERE id = ?
      `, [newTotalIncome, handoverId]);

      console.log(`🔄 Total de ingresos actualizado: $${newTotalIncome.toFixed(2)}`);
    } else {
      console.log('⚠️ No se encontró entrega de turno para hoy. Creando una básica...');

      // Crear una entrega de turno básica para hoy
      const [result] = await connection.execute(`
        INSERT INTO shift_handovers (
          shift_date, handover_time, status,
          total_income, cash_received, cash_delivered,
          created_at
        ) VALUES (?, NOW(), 'completed', ?, 0.00, 0.00, NOW())
      `, [today, totalIncome]);

      handoverId = result.insertId;
      console.log(`✅ Nueva entrega de turno creada (ID: ${handoverId})`);
    }

    // 4. Agregar transacciones detalladas para cada reserva
    console.log('🗑️ Eliminando transacciones anteriores de reservas de hoy...');
    await connection.execute(`
      DELETE FROM shift_transactions
      WHERE handover_id = ? AND category = 'booking_income'
    `, [handoverId]);

    console.log('💳 Agregando transacciones para cada reserva...');
    for (const booking of bookings) {
      await connection.execute(`
        INSERT INTO shift_transactions (
          handover_id, type, category, description, amount, payment_method
        ) VALUES (?, 'income', 'booking_income', ?, ?, 'cash')
      `, [
        handoverId,
        `Reserva ${booking.guest_name} - Habitación`,
        booking.total_amount
      ]);
    }

    console.log(`✅ ${bookings.length} transacciones agregadas`);

    // 5. Verificar el resultado final
    const [finalHandover] = await connection.execute(`
      SELECT total_income FROM shift_handovers WHERE id = ?
    `, [handoverId]);

    const [finalTransactions] = await connection.execute(`
      SELECT COUNT(*) as count, SUM(amount) as total FROM shift_transactions
      WHERE handover_id = ? AND type = 'income'
    `, [handoverId]);

    console.log('\n🎉 ACTUALIZACIÓN COMPLETADA');
    console.log('=====================================');
    console.log(`💰 Total de ingresos en entrega: $${parseFloat(finalHandover[0].total_income).toFixed(2)}`);
    console.log(`📊 Transacciones de ingresos: ${finalTransactions[0].count} (${finalTransactions[0].total ? '$' + parseFloat(finalTransactions[0].total).toFixed(2) : '$0.00'})`);

  } catch (error) {
    console.error('❌ Error actualizando ingresos de hoy:', error.message);
    console.error('📍 Stack:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔐 Conexión cerrada');
    }
  }
}

// Ejecutar la actualización
updateTodayIncome().catch(console.error);