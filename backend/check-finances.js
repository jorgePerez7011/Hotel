import mysql from 'mysql2/promise';

// Configuración de la base de datos
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'hotelsol'
};

async function checkAndFixFinances() {
  let connection;
  
  try {
    console.log('🔄 Conectando a la base de datos...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado a MySQL');

    // Verificar estructura de la tabla
    console.log('🔍 Verificando estructura de shift_handovers...');
    const [columns] = await connection.execute('DESCRIBE shift_handovers');
    console.log('📋 Columnas existentes:');
    columns.forEach(col => console.log(`  - ${col.Field}: ${col.Type}`));

    // Verificar registros existentes
    console.log('\n🔍 Verificando registros existentes...');
    const [existingHandovers] = await connection.execute('SELECT * FROM shift_handovers ORDER BY id');
    console.log(`📊 Total de registros: ${existingHandovers.length}`);
    
    if (existingHandovers.length > 0) {
      console.log('📋 Primeros registros:');
      existingHandovers.slice(0, 3).forEach(record => {
        console.log(`  ID: ${record.id}, Empleado entrega: ${record.employee_from_id}, Empleado recibe: ${record.employee_to_id}`);
      });

      // Insertar transacciones para IDs válidos
      console.log('\n🔄 Insertando transacciones de ejemplo...');
      
      const firstId = existingHandovers[0].id;
      const secondId = existingHandovers.length > 1 ? existingHandovers[1].id : firstId;

      // Primero limpiar transacciones existentes para evitar duplicados
      await connection.execute('DELETE FROM shift_transactions WHERE handover_id IN (?, ?)', [firstId, secondId]);

      const sampleTransactions = [
        [firstId, 'income', 'Hospedaje', 'Pago habitación 101 - 2 noches', 150.00, 'cash'],
        [firstId, 'income', 'Servicios', 'Servicio a la habitación', 25.00, 'card'],
        [firstId, 'expense', 'Suministros', 'Productos de limpieza', 30.00, 'cash'],
        [firstId, 'expense', 'Mantenimiento', 'Reparación llave habitación 205', 15.00, 'cash'],
        [secondId, 'income', 'Hospedaje', 'Check-in habitación 203', 200.00, 'card'],
        [secondId, 'income', 'Restaurante', 'Consumo en restaurante', 45.00, 'cash'],
        [secondId, 'expense', 'Servicios', 'Lavandería externa', 80.00, 'transfer']
      ];

      for (const transaction of sampleTransactions) {
        await connection.execute(
          'INSERT INTO shift_transactions (handover_id, type, category, description, amount, payment_method) VALUES (?, ?, ?, ?, ?, ?)',
          transaction
        );
      }
      
      console.log('✅ Transacciones insertadas exitosamente');

      // Actualizar registros con datos financieros
      console.log('🔄 Actualizando registros con datos financieros...');
      
      // Datos para el primer registro
      await connection.execute(`
        UPDATE shift_handovers 
        SET 
          cash_received = 500.00,
          cash_delivered = 670.00,
          total_income = 175.00,
          total_expenses = 45.00,
          cash_difference = 130.00,
          financial_notes = 'Turno con buenas ventas, caja balanceada correctamente'
        WHERE id = ?
      `, [firstId]);

      // Datos para el segundo registro (si existe)
      if (secondId !== firstId) {
        await connection.execute(`
          UPDATE shift_handovers 
          SET 
            cash_received = 670.00,
            cash_delivered = 835.00,
            total_income = 245.00,
            total_expenses = 80.00,
            cash_difference = 165.00,
            financial_notes = 'Ingreso importante por habitación ejecutiva, gastos controlados'
          WHERE id = ?
        `, [secondId]);
      }

      console.log('✅ Registros actualizados con datos financieros');
    }

    // Obtener estadísticas finales
    console.log('\n🔄 Calculando estadísticas...');
    
    const [stats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_handovers,
        COALESCE(SUM(total_income), 0) as total_income_all,
        COALESCE(SUM(total_expenses), 0) as total_expenses_all,
        COALESCE(SUM(cash_difference), 0) as total_cash_difference,
        COALESCE(AVG(cash_received), 0) as avg_cash_received,
        COALESCE(AVG(cash_delivered), 0) as avg_cash_delivered
      FROM shift_handovers
    `);

    const [transactionStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_transactions,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income_detailed,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses_detailed,
        COUNT(CASE WHEN type = 'income' THEN 1 END) as income_count,
        COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count
      FROM shift_transactions
    `);

    console.log('\n📊 ESTADÍSTICAS DEL SISTEMA FINANCIERO');
    console.log('=====================================');
    console.log(`💰 Total de entregas registradas: ${stats[0].total_handovers}`);
    console.log(`💵 Ingresos totales: $${Number(stats[0].total_income_all).toFixed(2)}`);
    console.log(`💸 Egresos totales: $${Number(stats[0].total_expenses_all).toFixed(2)}`);
    console.log(`🏦 Diferencia neta en caja: $${Number(stats[0].total_cash_difference).toFixed(2)}`);
    console.log(`💰 Promedio dinero recibido: $${Number(stats[0].avg_cash_received).toFixed(2)}`);
    console.log(`💰 Promedio dinero entregado: $${Number(stats[0].avg_cash_delivered).toFixed(2)}`);
    console.log(`📝 Total transacciones: ${transactionStats[0].total_transactions}`);
    console.log(`📈 Transacciones de ingresos: ${transactionStats[0].income_count} ($${Number(transactionStats[0].total_income_detailed).toFixed(2)})`);
    console.log(`📉 Transacciones de egresos: ${transactionStats[0].expense_count} ($${Number(transactionStats[0].total_expenses_detailed).toFixed(2)})`);
    
    console.log('\n✅ Sistema financiero de entrega de turnos configurado exitosamente');
    console.log('🎯 Ahora puedes actualizar el frontend para mostrar esta información');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('📍 Stack:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔐 Conexión cerrada');
    }
  }
}

// Ejecutar la configuración
checkAndFixFinances().catch(console.error);