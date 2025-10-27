import pool from './config/mysql.js';

async function checkBookingsTable() {
  try {
    const [tables] = await pool.execute('SHOW TABLES LIKE "bookings"');
    console.log('Tabla bookings existe:', tables.length > 0);
    
    if (tables.length > 0) {
      const [columns] = await pool.execute('DESCRIBE bookings');
      console.log('Columnas de bookings:');
      columns.forEach(col => {
        console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? col.Key : ''}`);
      });
    } else {
      console.log('La tabla bookings no existe. Se necesita crear.');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkBookingsTable();