import pool from './config/mysql.js';

async function updateRoomsTableStructure() {
  try {
    console.log('🔧 Actualizando estructura de tabla rooms...');
    
    // Agregar columnas faltantes
    const alterQueries = [
      'ALTER TABLE rooms ADD COLUMN IF NOT EXISTS floor INT DEFAULT 1',
      'ALTER TABLE rooms ADD COLUMN IF NOT EXISTS description TEXT',
      'ALTER TABLE rooms ADD COLUMN IF NOT EXISTS current_status VARCHAR(20) DEFAULT "available"',
      'ALTER TABLE rooms ADD COLUMN IF NOT EXISTS base_price DECIMAL(10,2) DEFAULT 0.00',
      'ALTER TABLE rooms MODIFY COLUMN price_per_night DECIMAL(10,2) DEFAULT 0.00'
    ];
    
    for (const query of alterQueries) {
      try {
        await pool.execute(query);
        console.log('✓ Ejecutado:', query.split(' ').slice(0, 7).join(' ') + '...');
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log('- Ya existe la columna:', query.split(' ')[6]);
        } else {
          console.error('Error en query:', error.message);
        }
      }
    }
    
    // Verificar la estructura actualizada
    const [columns] = await pool.execute('DESCRIBE rooms');
    console.log('\n📋 Estructura actualizada de rooms:');
    columns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? col.Key : ''}`);
    });
    
    console.log('✅ Tabla rooms actualizada correctamente');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

updateRoomsTableStructure();