import mysql from 'mysql2/promise';

// Configuración de la base de datos
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'hotelsol'
};

async function fixHandoverFinances() {
  let connection;
  
  try {
    console.log('🔄 Conectando a la base de datos...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado a MySQL');

    // Verificar IDs existentes
    const [existingHandovers] = await connection.execute('SELECT id, employee_name FROM shift_handovers ORDER BY id');
    console.log('📋 Entregas existentes:', existingHandovers);

    // Solo insertar transacciones para IDs que existen
    if (existingHandovers.length > 0) {
      console.log('🔄 Insertando transacciones para IDs válidos...');
      
      const firstId = existingHandovers[0].id;
      const secondId = existingHandovers.length > 1 ? existingHandovers[1].id : firstId;

      const sampleTransactions = `
        INSERT INTO shift_transactions (handover_id, type, category, description, amount, payment_method) VALUES
        (${firstId}, 'income', 'Hospedaje', 'Pago habitación 101 - 2 noches', 150.00, 'cash'),
        (${firstId}, 'income', 'Servicios', 'Servicio a la habitación', 25.00, 'card'),
        (${firstId}, 'expense', 'Suministros', 'Productos de limpieza', 30.00, 'cash'),
        (${firstId}, 'expense', 'Mantenimiento', 'Reparación llave habitación 205', 15.00, 'cash'),
        (${secondId}, 'income', 'Hospedaje', 'Check-in habitación 203', 200.00, 'card'),
        (${secondId}, 'income', 'Restaurante', 'Consumo en restaurante', 45.00, 'cash'),
        (${secondId}, 'expense', 'Servicios', 'Lavandería externa', 80.00, 'transfer')
        ON DUPLICATE KEY UPDATE id=id
      `;
      
      await connection.execute(sampleTransactions);
      console.log('✅ Transacciones insertadas exitosamente');

      // Actualizar los registros existentes con datos financieros
      console.log('🔄 Actualizando registros con datos financieros...');
      
      for (let i = 0; i < existingHandovers.length; i++) {
        const handoverId = existingHandovers[i].id;
        const cashReceived = i === 0 ? 500.00 : 670.00;
        const cashDelivered = i === 0 ? 670.00 : 805.00;
        const totalIncome = i === 0 ? 175.00 : 245.00;
        const totalExpenses = i === 0 ? 45.00 : 80.00;
        const cashDifference = totalIncome - totalExpenses;
        const financialNotes = i === 0 
          ? 'Turno con buenas ventas, caja balanceada correctamente'
          : 'Ingreso importante por habitación ejecutiva, gastos controlados';

        await connection.execute(`
          UPDATE shift_handovers 
          SET 
            cash_received = ?,
            cash_delivered = ?,
            total_income = ?,
            total_expenses = ?,
            cash_difference = ?,
            financial_notes = ?
          WHERE id = ?
        `, [cashReceived, cashDelivered, totalIncome, totalExpenses, cashDifference, financialNotes, handoverId]);
      }

      console.log('✅ Registros actualizados con datos financieros');
    }

    // Obtener estadísticas finales
    const [stats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_handovers,
        COALESCE(SUM(total_income), 0) as total_income_all,
        COALESCE(SUM(total_expenses), 0) as total_expenses_all,
        COALESCE(SUM(cash_difference), 0) as total_cash_difference
      FROM shift_handovers
    `);

    const [transactionStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_transactions,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income_detailed,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses_detailed
      FROM shift_transactions
    `);

    console.log('\n📊 ESTADÍSTICAS DEL SISTEMA FINANCIERO');
    console.log('=====================================');
    console.log(`💰 Total de entregas con datos financieros: ${stats[0].total_handovers}`);
    console.log(`💵 Ingresos totales registrados: $${stats[0].total_income_all}`);
    console.log(`💸 Egresos totales registrados: $${stats[0].total_expenses_all}`);
    console.log(`🏦 Diferencia total en caja: $${stats[0].total_cash_difference}`);
    console.log(`📝 Transacciones detalladas: ${transactionStats[0].total_transactions}`);
    console.log(`📈 Ingresos detallados: $${transactionStats[0].total_income_detailed}`);
    console.log(`📉 Egresos detallados: $${transactionStats[0].total_expenses_detailed}`);
    
    console.log('\n✅ Sistema financiero de entrega de turnos configurado exitosamente');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔐 Conexión cerrada');
    }
  }
}

// Ejecutar la actualización
fixHandoverFinances().catch(console.error);