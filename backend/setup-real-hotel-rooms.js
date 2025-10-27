import pool from './config/mysql.js';

async function setupRealHotelRooms() {
  try {
    console.log('🏨 Configurando las 20 habitaciones del Hotel Sol...');
    
    // Limpiar habitaciones existentes
    await pool.execute('DELETE FROM rooms');
    console.log('✅ Habitaciones anteriores eliminadas');
    
    // Piso 1: 5 dobles, 2 sencillas, 1 familiar, 1 duplex (9 habitaciones)
    const piso1 = [
      // 5 Dobles
      { room_number: '101', type: 'doble', capacity: 2, base_price: 85.00, floor: 1, description: 'Habitación doble con dos camas individuales, baño privado, aire acondicionado y TV.' },
      { room_number: '102', type: 'doble', capacity: 2, base_price: 85.00, floor: 1, description: 'Habitación doble con cama matrimonial, baño privado, aire acondicionado y TV.' },
      { room_number: '103', type: 'doble', capacity: 2, base_price: 85.00, floor: 1, description: 'Habitación doble con dos camas individuales, baño privado, aire acondicionado y TV.' },
      { room_number: '104', type: 'doble', capacity: 2, base_price: 85.00, floor: 1, description: 'Habitación doble con cama matrimonial, baño privado, aire acondicionado y TV.' },
      { room_number: '105', type: 'doble', capacity: 2, base_price: 85.00, floor: 1, description: 'Habitación doble con dos camas individuales, baño privado, aire acondicionado y TV.' },
      
      // 2 Sencillas
      { room_number: '106', type: 'sencilla', capacity: 1, base_price: 65.00, floor: 1, description: 'Habitación sencilla con cama individual, baño privado, aire acondicionado y TV.' },
      { room_number: '107', type: 'sencilla', capacity: 1, base_price: 65.00, floor: 1, description: 'Habitación sencilla con cama individual, baño privado, aire acondicionado y TV.' },
      
      // 1 Familiar
      { room_number: '108', type: 'familiar', capacity: 4, base_price: 120.00, floor: 1, description: 'Habitación familiar con cama matrimonial y dos camas individuales, baño privado, aire acondicionado y TV.' },
      
      // 1 Duplex
      { room_number: '109', type: 'duplex', capacity: 3, base_price: 140.00, floor: 1, description: 'Habitación duplex de dos plantas con cama matrimonial arriba, sala abajo, baño privado, aire acondicionado y TV.' }
    ];
    
    // Piso 2: 10 dobles, 1 suite (11 habitaciones)
    const piso2 = [
      // 10 Dobles
      { room_number: '201', type: 'doble', capacity: 2, base_price: 90.00, floor: 2, description: 'Habitación doble con dos camas individuales, baño privado, aire acondicionado y TV. Vista panorámica.' },
      { room_number: '202', type: 'doble', capacity: 2, base_price: 90.00, floor: 2, description: 'Habitación doble con cama matrimonial, baño privado, aire acondicionado y TV. Vista panorámica.' },
      { room_number: '203', type: 'doble', capacity: 2, base_price: 90.00, floor: 2, description: 'Habitación doble con dos camas individuales, baño privado, aire acondicionado y TV. Vista panorámica.' },
      { room_number: '204', type: 'doble', capacity: 2, base_price: 90.00, floor: 2, description: 'Habitación doble con cama matrimonial, baño privado, aire acondicionado y TV. Vista panorámica.' },
      { room_number: '205', type: 'doble', capacity: 2, base_price: 90.00, floor: 2, description: 'Habitación doble con dos camas individuales, baño privado, aire acondicionado y TV. Vista panorámica.' },
      { room_number: '206', type: 'doble', capacity: 2, base_price: 90.00, floor: 2, description: 'Habitación doble con cama matrimonial, baño privado, aire acondicionado y TV. Vista panorámica.' },
      { room_number: '207', type: 'doble', capacity: 2, base_price: 90.00, floor: 2, description: 'Habitación doble con dos camas individuales, baño privado, aire acondicionado y TV. Vista panorámica.' },
      { room_number: '208', type: 'doble', capacity: 2, base_price: 90.00, floor: 2, description: 'Habitación doble con cama matrimonial, baño privado, aire acondicionado y TV. Vista panorámica.' },
      { room_number: '209', type: 'doble', capacity: 2, base_price: 90.00, floor: 2, description: 'Habitación doble con dos camas individuales, baño privado, aire acondicionado y TV. Vista panorámica.' },
      { room_number: '210', type: 'doble', capacity: 2, base_price: 90.00, floor: 2, description: 'Habitación doble con cama matrimonial, baño privado, aire acondicionado y TV. Vista panorámica.' },
      
      // 1 Suite
      { room_number: '211', type: 'suite', capacity: 3, base_price: 180.00, floor: 2, description: 'Suite de lujo con cama king size, sala de estar, baño con jacuzzi, aire acondicionado, TV y minibar. Vista premium.' }
    ];
    
    const allRooms = [...piso1, ...piso2];
    
    // Insertar todas las habitaciones
    for (const room of allRooms) {
      await pool.execute(`
        INSERT INTO rooms (room_number, type, capacity, base_price, price_per_night, floor, description, current_status, is_available, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'available', 1, NOW())
      `, [room.room_number, room.type, room.capacity, room.base_price, room.base_price, room.floor, room.description]);
      
      console.log(`✅ Habitación ${room.room_number} - ${room.type} (${room.capacity} personas) - $${room.base_price}`);
    }
    
    console.log('\n🎉 ¡Configuración completada exitosamente!');
    console.log(`📊 Total: ${allRooms.length} habitaciones configuradas`);
    
    // Mostrar resumen por piso y tipo
    console.log('\n📋 RESUMEN DE HABITACIONES:');
    console.log('Piso 1 (9 habitaciones):');
    console.log('  - 5 Dobles (101-105) - $85.00 c/u');
    console.log('  - 2 Sencillas (106-107) - $65.00 c/u');
    console.log('  - 1 Familiar (108) - $120.00');
    console.log('  - 1 Duplex (109) - $140.00');
    
    console.log('\nPiso 2 (11 habitaciones):');
    console.log('  - 10 Dobles (201-210) - $90.00 c/u');
    console.log('  - 1 Suite (211) - $180.00');
    
    // Verificar la configuración
    const [rooms] = await pool.execute('SELECT COUNT(*) as total, floor, type FROM rooms GROUP BY floor, type ORDER BY floor, type');
    console.log('\n🔍 VERIFICACIÓN EN BASE DE DATOS:');
    rooms.forEach(room => {
      console.log(`  Piso ${room.floor}: ${room.total} ${room.type}(s)`);
    });
    
    const [totalCount] = await pool.execute('SELECT COUNT(*) as total FROM rooms');
    console.log(`\n✨ Total en base de datos: ${totalCount[0].total} habitaciones`);
    
  } catch (error) {
    console.error('❌ Error configurando habitaciones:', error.message);
  } finally {
    await pool.end();
  }
}

setupRealHotelRooms();