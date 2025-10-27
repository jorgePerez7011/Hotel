import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'hotelsol',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function updateBookingsTable() {
  try {
    console.log('🔄 Actualizando tabla bookings para check-in/check-out...');

    // Agregar columnas para tiempos reales de check-in y check-out
    try {
      await pool.execute(`
        ALTER TABLE bookings 
        ADD COLUMN actual_checkin_time DATETIME NULL,
        ADD COLUMN actual_checkout_time DATETIME NULL
      `);
      console.log('✅ Columnas agregadas: actual_checkin_time, actual_checkout_time');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️ Las columnas ya existen, continuando...');
      } else {
        throw error;
      }
    }

    // Verificar la estructura actualizada
    const [columns] = await pool.execute(`
      SHOW COLUMNS FROM bookings
    `);
    
    console.log('\n📋 Estructura actualizada de la tabla bookings:');
    columns.forEach(col => {
      console.log(`  ${col.Field} - ${col.Type} - ${col.Null} - ${col.Default}`);
    });

    // Verificar bookings existentes
    const [bookings] = await pool.execute(`
      SELECT id, guest_name, room_id, status, check_in_date, check_out_date,
             actual_checkin_time, actual_checkout_time
      FROM bookings
    `);

    console.log(`\n📊 Total de reservas: ${bookings.length}`);
    if (bookings.length > 0) {
      console.log('Primeras 3 reservas:');
      bookings.slice(0, 3).forEach(booking => {
        console.log(`  - ID ${booking.id}: ${booking.guest_name} - Habitación ${booking.room_id} - Estado: ${booking.status}`);
      });
    }

    console.log('\n✅ Actualización completada exitosamente');

  } catch (error) {
    console.error('❌ Error actualizando la tabla bookings:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

updateBookingsTable();