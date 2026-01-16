import pool from './config/mysql.js';

const addSelectedRoomsColumn = async () => {
  try {
    console.log('🔄 Agregando columna selected_rooms a shift_handovers...');
    
    const connection = await pool.getConnection();
    
    // Agregar la columna si no existe
    await connection.execute(`
      ALTER TABLE shift_handovers ADD COLUMN IF NOT EXISTS selected_rooms JSON
    `);
    
    console.log('✅ Columna selected_rooms agregada exitosamente');
    
    // Agregar también cash_received, cash_delivered si no existen
    await connection.execute(`
      ALTER TABLE shift_handovers ADD COLUMN IF NOT EXISTS cash_received DECIMAL(10, 2) DEFAULT 0
    `);
    
    await connection.execute(`
      ALTER TABLE shift_handovers ADD COLUMN IF NOT EXISTS cash_delivered DECIMAL(10, 2) DEFAULT 0
    `);
    
    await connection.execute(`
      ALTER TABLE shift_handovers ADD COLUMN IF NOT EXISTS total_income DECIMAL(10, 2) DEFAULT 0
    `);
    
    await connection.execute(`
      ALTER TABLE shift_handovers ADD COLUMN IF NOT EXISTS total_expenses DECIMAL(10, 2) DEFAULT 0
    `);
    
    await connection.execute(`
      ALTER TABLE shift_handovers ADD COLUMN IF NOT EXISTS cash_difference DECIMAL(10, 2) DEFAULT 0
    `);
    
    await connection.execute(`
      ALTER TABLE shift_handovers ADD COLUMN IF NOT EXISTS financial_notes TEXT
    `);
    
    console.log('✅ Todas las columnas necesarias han sido agregadas');
    
    connection.release();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

addSelectedRoomsColumn();
