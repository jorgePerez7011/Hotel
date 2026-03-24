import pool from './config/mysql.js';

async function createInventoryTable() {
  try {
    console.log('📊 Creando tabla de inventario...');
    
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS inventory_products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        quantity INT DEFAULT 0,
        min_stock INT DEFAULT 0,
        unit_price DECIMAL(10, 2) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_code (code)
      )
    `);
    
    console.log('✅ Tabla inventory_products creada correctamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creando tabla:', error.message);
    process.exit(1);
  }
}

createInventoryTable();
