import pool from './config/mysql.js';

const updateRooms = async () => {
  try {
    console.log('🏨 Actualizando habitaciones del Hotel Sol...');
    
    // Obtener conexión
    const connection = await pool.getConnection();
    
    // Limpiar habitaciones existentes
    await connection.execute('DELETE FROM rooms');
    console.log('✅ Habitaciones existentes eliminadas');
    
    // Habitaciones del Piso 1
    const floor1Rooms = [
      // 5 habitaciones dobles (101-105)
      ['101', 'double', 120.00, 2, JSON.stringify(['WiFi', 'TV', 'AC', 'Minibar'])],
      ['102', 'double', 120.00, 2, JSON.stringify(['WiFi', 'TV', 'AC', 'Minibar'])],
      ['103', 'double', 120.00, 2, JSON.stringify(['WiFi', 'TV', 'AC', 'Minibar'])],
      ['104', 'double', 120.00, 2, JSON.stringify(['WiFi', 'TV', 'AC', 'Minibar'])],
      ['105', 'double', 120.00, 2, JSON.stringify(['WiFi', 'TV', 'AC', 'Minibar'])],
      
      // 2 habitaciones sencillas (106-107)
      ['106', 'single', 80.00, 1, JSON.stringify(['WiFi', 'TV', 'AC'])],
      ['107', 'single', 80.00, 1, JSON.stringify(['WiFi', 'TV', 'AC'])],
      
      // 1 habitación familiar (108)
      ['108', 'family', 200.00, 4, JSON.stringify(['WiFi', 'TV', 'AC', 'Minibar', 'Kitchenette', 'Sofa cama'])],
      
      // 1 habitación duplex (109)
      ['109', 'duplex', 250.00, 6, JSON.stringify(['WiFi', 'TV', 'AC', 'Minibar', 'Kitchenette', 'Balcón', 'Dos niveles'])]
    ];

    // Habitaciones del Piso 2 (11 habitaciones para completar las 20 totales)
    const floor2Rooms = [
      // 9 habitaciones dobles ejecutivas (201-209) - Todas con escritorio y switch
      ['201', 'executive', 150.00, 2, JSON.stringify(['WiFi', 'TV', 'AC', 'Minibar', 'Escritorio ejecutivo', 'Switch ethernet', 'Balcón'])],
      ['202', 'executive', 150.00, 2, JSON.stringify(['WiFi', 'TV', 'AC', 'Minibar', 'Escritorio ejecutivo', 'Switch ethernet', 'Balcón'])],
      ['203', 'executive', 150.00, 2, JSON.stringify(['WiFi', 'TV', 'AC', 'Minibar', 'Escritorio ejecutivo', 'Switch ethernet', 'Balcón'])],
      ['204', 'executive', 150.00, 2, JSON.stringify(['WiFi', 'TV', 'AC', 'Minibar', 'Escritorio ejecutivo', 'Switch ethernet', 'Balcón'])],
      ['205', 'executive', 150.00, 2, JSON.stringify(['WiFi', 'TV', 'AC', 'Minibar', 'Escritorio ejecutivo', 'Switch ethernet', 'Balcón'])],
      ['206', 'executive', 150.00, 2, JSON.stringify(['WiFi', 'TV', 'AC', 'Minibar', 'Escritorio ejecutivo', 'Switch ethernet', 'Balcón'])],
      ['207', 'executive', 150.00, 2, JSON.stringify(['WiFi', 'TV', 'AC', 'Minibar', 'Escritorio ejecutivo', 'Switch ethernet', 'Balcón'])],
      ['208', 'executive', 150.00, 2, JSON.stringify(['WiFi', 'TV', 'AC', 'Minibar', 'Escritorio ejecutivo', 'Switch ethernet', 'Balcón'])],
      ['209', 'executive', 150.00, 2, JSON.stringify(['WiFi', 'TV', 'AC', 'Minibar', 'Escritorio ejecutivo', 'Switch ethernet', 'Balcón'])],
      
      // 2 suites premium (210-211) - Las mejores habitaciones
      ['210', 'suite', 300.00, 2, JSON.stringify(['WiFi', 'TV', 'AC', 'Minibar', 'Jacuzzi', 'Escritorio ejecutivo', 'Switch ethernet', 'Balcón', 'Vista panorámica'])],
      ['211', 'suite', 320.00, 2, JSON.stringify(['WiFi', 'TV', 'AC', 'Minibar', 'Jacuzzi', 'Escritorio ejecutivo', 'Switch ethernet', 'Balcón', 'Vista panorámica', 'Servicio de habitación 24h'])]
    ];

    // Insertar habitaciones del piso 1
    for (const room of floor1Rooms) {
      await connection.execute(
        'INSERT INTO rooms (room_number, type, price_per_night, capacity, amenities) VALUES (?, ?, ?, ?, ?)',
        room
      );
    }
    console.log('✅ Habitaciones del Piso 1 insertadas (9 habitaciones)');

    // Insertar habitaciones del piso 2
    for (const room of floor2Rooms) {
      await connection.execute(
        'INSERT INTO rooms (room_number, type, price_per_night, capacity, amenities) VALUES (?, ?, ?, ?, ?)',
        room
      );
    }
    console.log('✅ Habitaciones del Piso 2 insertadas (11 habitaciones - 9 ejecutivas + 2 suites)');

    // Verificar total de habitaciones
    const [count] = await connection.execute('SELECT COUNT(*) as total FROM rooms');
    console.log(`✅ Total de habitaciones: ${count[0].total}`);

    // Mostrar resumen por tipo
    const [summary] = await connection.execute(`
      SELECT type, COUNT(*) as cantidad, AVG(price_per_night) as precio_promedio 
      FROM rooms 
      GROUP BY type 
      ORDER BY type
    `);

    console.log('\n📊 Resumen de habitaciones por tipo:');
    summary.forEach(row => {
      console.log(`- ${row.type}: ${row.cantidad} habitaciones (Precio promedio: $${row.precio_promedio})`);
    });

    // Mostrar distribución por piso
    const [floor1Count] = await connection.execute("SELECT COUNT(*) as total FROM rooms WHERE room_number LIKE '1%'");
    const [floor2Count] = await connection.execute("SELECT COUNT(*) as total FROM rooms WHERE room_number LIKE '2%'");
    
    console.log('\n🏢 Distribución por pisos:');
    console.log(`- Piso 1: ${floor1Count[0].total} habitaciones (5 dobles, 2 sencillas, 1 familiar, 1 duplex)`);
    console.log(`- Piso 2: ${floor2Count[0].total} habitaciones (9 ejecutivas con escritorio/switch, 2 suites premium)`);
    
    connection.release();
    console.log('\n✅ Actualización de habitaciones completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error actualizando habitaciones:', error);
  }
  
  process.exit(0);
};

updateRooms();