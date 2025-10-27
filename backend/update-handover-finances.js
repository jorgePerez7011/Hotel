import mysql from 'mysql2/promise';

// Configuración de la base de datos
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'hotelsol'
};

async function updateHandoverFinances() {
  let connection;
  
  try {
    console.log('🔄 Conectando a la base de datos...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado a MySQL');

    // Agregar campos financieros a la tabla shift_handovers
    console.log('🔄 Agregando campos financieros...');
    
    const addFinancialFields = `
      ALTER TABLE shift_handovers 
      ADD COLUMN IF NOT EXISTS cash_received DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Dinero en caja al recibir turno',
      ADD COLUMN IF NOT EXISTS cash_delivered DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Dinero en caja al entregar turno',
      ADD COLUMN IF NOT EXISTS total_income DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Total de ingresos durante el turno',
      ADD COLUMN IF NOT EXISTS total_expenses DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Total de egresos durante el turno',
      ADD COLUMN IF NOT EXISTS income_details JSON COMMENT 'Detalles de ingresos',
      ADD COLUMN IF NOT EXISTS expense_details JSON COMMENT 'Detalles de egresos',
      ADD COLUMN IF NOT EXISTS cash_difference DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Diferencia en caja (calculado)',
      ADD COLUMN IF NOT EXISTS financial_notes TEXT COMMENT 'Observaciones financieras adicionales'
    `;
    
    await connection.execute(addFinancialFields);
    console.log('✅ Campos financieros agregados exitosamente');

    // Crear tabla para el detalle de transacciones si no existe
    console.log('🔄 Creando tabla de transacciones...');
    
    const createTransactionsTable = `
      CREATE TABLE IF NOT EXISTS shift_transactions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        handover_id INT NOT NULL,
        type ENUM('income', 'expense') NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        amount DECIMAL(10,2) NOT NULL,
        payment_method ENUM('cash', 'card', 'transfer', 'other') DEFAULT 'cash',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (handover_id) REFERENCES shift_handovers(id) ON DELETE CASCADE,
        INDEX idx_handover_type (handover_id, type),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    await connection.execute(createTransactionsTable);
    console.log('✅ Tabla shift_transactions creada exitosamente');

    // Insertar datos de ejemplo para transacciones
    console.log('🔄 Insertando datos de ejemplo...');
    
    const sampleTransactions = `
      INSERT INTO shift_transactions (handover_id, type, category, description, amount, payment_method) VALUES
      (1, 'income', 'Hospedaje', 'Pago habitación 101 - 2 noches', 150.00, 'cash'),
      (1, 'income', 'Servicios', 'Servicio a la habitación', 25.00, 'card'),
      (1, 'expense', 'Suministros', 'Productos de limpieza', 30.00, 'cash'),
      (1, 'expense', 'Mantenimiento', 'Reparación llave habitación 205', 15.00, 'cash'),
      (2, 'income', 'Hospedaje', 'Check-in habitación 203', 200.00, 'card'),
      (2, 'income', 'Restaurante', 'Consumo en restaurante', 45.00, 'cash'),
      (2, 'expense', 'Servicios', 'Lavandería externa', 80.00, 'transfer')
      ON DUPLICATE KEY UPDATE id=id
    `;
    
    await connection.execute(sampleTransactions);

    // Actualizar los registros existentes con datos financieros de ejemplo
    console.log('🔄 Actualizando registros existentes...');
    
    const updateExistingRecords = `
      UPDATE shift_handovers 
      SET 
        cash_received = CASE 
          WHEN id = 1 THEN 500.00 
          WHEN id = 2 THEN 670.00 
          ELSE 500.00 
        END,
        cash_delivered = CASE 
          WHEN id = 1 THEN 670.00 
          WHEN id = 2 THEN 805.00 
          ELSE 670.00 
        END,
        total_income = CASE 
          WHEN id = 1 THEN 175.00 
          WHEN id = 2 THEN 245.00 
          ELSE 175.00 
        END,
        total_expenses = CASE 
          WHEN id = 1 THEN 45.00 
          WHEN id = 2 THEN 80.00 
          ELSE 45.00 
        END,
        cash_difference = CASE 
          WHEN id = 1 THEN 130.00 
          WHEN id = 2 THEN 135.00 
          ELSE 130.00 
        END,
        financial_notes = CASE 
          WHEN id = 1 THEN 'Turno con buenas ventas, caja balanceada correctamente'
          WHEN id = 2 THEN 'Ingreso importante por habitación ejecutiva, gastos controlados'
          ELSE 'Registro actualizado con datos financieros'
        END
      WHERE id IN (1, 2)
    `;
    
    await connection.execute(updateExistingRecords);

    // Obtener estadísticas
    const [stats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_handovers,
        SUM(total_income) as total_income_all,
        SUM(total_expenses) as total_expenses_all,
        SUM(cash_difference) as total_cash_difference
      FROM shift_handovers
    `);

    const [transactionStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income_detailed,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses_detailed
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
updateHandoverFinances().catch(console.error);