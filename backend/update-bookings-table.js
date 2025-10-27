import pool from './config/mysql.js';

async function updateBookingsTable() {
  try {
    console.log('Actualizando tabla bookings...');
    
    // Agregar columnas faltantes
    const alterQueries = [
      'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS nights_booked INT DEFAULT 1',
      'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS price_per_night DECIMAL(10,2) DEFAULT 0.00',
      'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS notes TEXT'
    ];
    
    for (const query of alterQueries) {
      try {
        await pool.execute(query);
        console.log('✓ Ejecutado:', query.split(' ').slice(0, 7).join(' ') + '...');
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log('- Ya existe la columna:', query.split(' ')[6]);
        } else {
          throw error;
        }
      }
    }
    
    console.log('✅ Tabla bookings actualizada correctamente');
    
    // Verificar la estructura final
    const [columns] = await pool.execute('DESCRIBE bookings');
    console.log('\nEstructura final de la tabla:');
    columns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? col.Key : ''}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

updateBookingsTable();