import mysql from 'mysql2/promise';

// Configuración de la base de datos
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'hotelsol'
};

async function setupRealRooms() {
  let connection;
  
  try {
    console.log('🔄 Conectando a la base de datos...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado a MySQL');

    // Eliminar habitaciones de ejemplo
    console.log('🗑️  Eliminando habitaciones de ejemplo...');
    const deleteRooms = await connection.execute('DELETE FROM rooms');
    console.log(`✅ ${deleteRooms[0].affectedRows} habitaciones eliminadas`);

    // Reiniciar contador
    await connection.execute('ALTER TABLE rooms AUTO_INCREMENT = 1');
    console.log('✅ Contador reiniciado');

    console.log('\n🏨 Configurando 20 habitaciones reales del Hotel Sol...');
    console.log('====================================================');

    // Configurar habitaciones Piso 1 (101-109) - 9 habitaciones estándar
    console.log('🏢 PISO 1 - Habitaciones Estándar:');
    for (let i = 101; i <= 109; i++) {
      await connection.execute(`
        INSERT INTO rooms (room_number, type, capacity, price_per_night, amenities) 
        VALUES (?, 'standard', 2, 80.00, 'Habitación estándar con cama matrimonial, baño privado, TV, aire acondicionado')
      `, [i.toString()]);
      console.log(`✅ Habitación ${i} - Estándar - $80/noche`);
    }

    // Configurar habitaciones Piso 2 (201-211) - 11 habitaciones ejecutivas
    console.log('\n🏢 PISO 2 - Habitaciones Ejecutivas:');
    for (let i = 201; i <= 211; i++) {
      await connection.execute(`
        INSERT INTO rooms (room_number, type, capacity, price_per_night, amenities) 
        VALUES (?, 'executive', 2, 120.00, 'Habitación ejecutiva con cama king size, baño con jacuzzi, TV smart, aire acondicionado, minibar')
      `, [i.toString()]);
      console.log(`✅ Habitación ${i} - Ejecutiva - $120/noche`);
    }

    // Verificar configuración
    const [roomStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_rooms,
        SUM(CASE WHEN LEFT(room_number, 1) = '1' THEN 1 ELSE 0 END) as piso1_rooms,
        SUM(CASE WHEN LEFT(room_number, 1) = '2' THEN 1 ELSE 0 END) as piso2_rooms,
        SUM(CASE WHEN type = 'standard' THEN 1 ELSE 0 END) as standard_rooms,
        SUM(CASE WHEN type = 'executive' THEN 1 ELSE 0 END) as executive_rooms,
        AVG(CASE WHEN type = 'standard' THEN price_per_night END) as avg_standard_price,
        AVG(CASE WHEN type = 'executive' THEN price_per_night END) as avg_executive_price
      FROM rooms
    `);

    console.log('\n📊 RESUMEN DE HABITACIONES CONFIGURADAS:');
    console.log('=======================================');
    console.log(`🏨 Total habitaciones: ${roomStats[0].total_rooms}`);
    console.log(`🏢 Piso 1 (Estándar): ${roomStats[0].piso1_rooms} habitaciones`);
    console.log(`🏢 Piso 2 (Ejecutiva): ${roomStats[0].piso2_rooms} habitaciones`);
    console.log(`💰 Precio promedio estándar: $${Number(roomStats[0].avg_standard_price).toFixed(2)}/noche`);
    console.log(`💰 Precio promedio ejecutiva: $${Number(roomStats[0].avg_executive_price).toFixed(2)}/noche`);

    // Mostrar todas las habitaciones configuradas
    const [allRooms] = await connection.execute(`
      SELECT room_number, type, price_per_night, is_available 
      FROM rooms 
      ORDER BY room_number ASC
    `);

    console.log('\n🏨 HABITACIONES CONFIGURADAS:');
    console.log('============================');
    allRooms.forEach(room => {
      const floorName = room.room_number.startsWith('1') ? 'Piso 1' : 'Piso 2';
      const typeName = room.type === 'standard' ? 'Estándar' : 'Ejecutiva';
      const status = room.is_available ? 'Disponible' : 'No disponible';
      console.log(`🏠 ${room.room_number} | ${floorName} | ${typeName} | $${room.price_per_night}/noche | ${status}`);
    });

    console.log('\n🎉 HABITACIONES REALES CONFIGURADAS EXITOSAMENTE');
    console.log('===============================================');
    console.log('✅ 20 habitaciones del Hotel Sol configuradas');
    console.log('✅ Piso 1: 9 habitaciones estándar (101-109)');
    console.log('✅ Piso 2: 11 habitaciones ejecutivas (201-211)');
    console.log('✅ Precios y descripciones establecidos');
    console.log('✅ Todas disponibles para reservas');

  } catch (error) {
    console.error('❌ Error configurando habitaciones:', error.message);
    console.error('📍 Stack:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔐 Conexión cerrada');
    }
  }
}

// Ejecutar configuración
setupRealRooms().catch(console.error);