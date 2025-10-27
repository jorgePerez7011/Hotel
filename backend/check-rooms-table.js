import mysql from 'mysql2/promise';

// Configuración de la base de datos
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'hotelsol'
};

async function checkRoomsTable() {
  let connection;
  
  try {
    console.log('🔄 Conectando a la base de datos...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado a MySQL');

    // Verificar estructura de rooms
    console.log('🔍 Estructura de la tabla rooms:');
    const [columns] = await connection.execute('DESCRIBE rooms');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? '(NOT NULL)' : ''} ${col.Key} ${col.Default !== null ? `(Default: ${col.Default})` : ''}`);
    });

    // Ver datos existentes
    console.log('\n📋 Datos existentes en rooms:');
    const [rooms] = await connection.execute('SELECT * FROM rooms LIMIT 5');
    console.log(`Total habitaciones: ${rooms.length}`);
    
    if (rooms.length > 0) {
      console.log('Primeras 5 habitaciones:');
      rooms.forEach(room => {
        console.log(`  ID: ${room.id}, Nombre: ${room.room_number || room.number || 'N/A'}, Tipo: ${room.type || 'N/A'}, Piso: ${room.floor || 'N/A'}`);
      });
    }

    // Verificar tabla bookings
    console.log('\n🔍 Verificando tabla bookings...');
    try {
      const [bookingColumns] = await connection.execute('DESCRIBE bookings');
      console.log('✅ Tabla bookings existe');
      console.log('Columnas:');
      bookingColumns.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type}`);
      });

      const [bookings] = await connection.execute('SELECT COUNT(*) as count FROM bookings');
      console.log(`Total bookings: ${bookings[0].count}`);
    } catch (error) {
      console.log('❌ Tabla bookings no existe:', error.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔐 Conexión cerrada');
    }
  }
}

// Ejecutar verificación
checkRoomsTable().catch(console.error);