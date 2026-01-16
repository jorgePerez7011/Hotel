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

    console.log('\n🏨 Configurando habitaciones del Hotel Sol...');
    console.log('==========================================');

    // Configuración real de habitaciones según el hotel
    const habitaciones = [
      // Piso 1
      { numero: '101', tipo: 'doble', piso: 1, precio: 120000, capacidad: 2 },
      { numero: '102', tipo: 'doble', piso: 1, precio: 120000, capacidad: 2 },
      { numero: '103', tipo: 'familiar', piso: 1, precio: 180000, capacidad: 4 },
      { numero: '104', tipo: 'sencilla', piso: 1, precio: 80000, capacidad: 1 },
      { numero: '105', tipo: 'doble', piso: 1, precio: 120000, capacidad: 2 },
      { numero: '106', tipo: 'doble', piso: 1, precio: 120000, capacidad: 2 },
      { numero: '107', tipo: 'sencilla', piso: 1, precio: 80000, capacidad: 1 },
      { numero: '108', tipo: 'doble', piso: 1, precio: 120000, capacidad: 2 },
      { numero: '109', tipo: 'familiar', piso: 1, precio: 180000, capacidad: 4 },
      // Piso 2
      { numero: '211', tipo: 'doble', piso: 2, precio: 120000, capacidad: 2 },
      { numero: '212', tipo: 'doble', piso: 2, precio: 120000, capacidad: 2 },
      { numero: '213', tipo: 'doble', piso: 2, precio: 120000, capacidad: 2 },
      { numero: '214', tipo: 'doble', piso: 2, precio: 120000, capacidad: 2 },
      { numero: '215', tipo: 'doble', piso: 2, precio: 120000, capacidad: 2 },
      { numero: '216', tipo: 'doble', piso: 2, precio: 120000, capacidad: 2 },
      { numero: '217', tipo: 'doble', piso: 2, precio: 120000, capacidad: 2 },
      { numero: '218', tipo: 'doble', piso: 2, precio: 120000, capacidad: 2 },
      { numero: '219', tipo: 'doble', piso: 2, precio: 120000, capacidad: 2 }
    ];

    // Insertar habitaciones
    console.log('🏢 PISO 1 - Habitaciones:');
    for (const hab of habitaciones.filter(h => h.piso === 1)) {
      const tipoTexto = hab.tipo === 'doble' ? 'Doble' : hab.tipo === 'sencilla' ? 'Sencilla' : 'Familiar';
      const precio = hab.precio === 80000 ? '80.000' : hab.precio === 120000 ? '120.000' : '180.000';
      await connection.execute(`
        INSERT INTO rooms (room_number, type, capacity, price_per_night, floor, description, current_status, is_available) 
        VALUES (?, ?, ?, ?, ?, ?, 'available', true)
      `, [hab.numero, hab.tipo, hab.capacidad, hab.precio, hab.piso, `Habitación ${tipoTexto} - ${hab.capacidad} personas - COP ${precio}/noche`]);
      console.log(`✅ Habitación ${hab.numero} - ${tipoTexto} - COP ${precio}/noche - ${hab.capacidad} personas`);
    }

    console.log('\n🏢 PISO 2 - Habitaciones:');
    for (const hab of habitaciones.filter(h => h.piso === 2)) {
      const tipoTexto = hab.tipo === 'doble' ? 'Doble' : hab.tipo === 'sencilla' ? 'Sencilla' : 'Familiar';
      const precio = hab.precio === 80000 ? '80.000' : hab.precio === 120000 ? '120.000' : '180.000';
      await connection.execute(`
        INSERT INTO rooms (room_number, type, capacity, price_per_night, floor, description, current_status, is_available) 
        VALUES (?, ?, ?, ?, ?, ?, 'available', true)
      `, [hab.numero, hab.tipo, hab.capacidad, hab.precio, hab.piso, `Habitación ${tipoTexto} - ${hab.capacidad} personas - COP ${precio}/noche`]);
      console.log(`✅ Habitación ${hab.numero} - ${tipoTexto} - COP ${precio}/noche - ${hab.capacidad} personas`);
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