import fetch from 'node-fetch';

async function testRoomsEndpoint() {
  try {
    console.log('🔍 Probando endpoint de habitaciones...');
    
    const response = await fetch('http://localhost:4000/api/hotel/rooms');
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Success:', data.success);
    console.log('Total habitaciones:', data.rooms?.length || 0);
    
    if (data.rooms && data.rooms.length > 0) {
      console.log('\n📋 Primeras 3 habitaciones:');
      data.rooms.slice(0, 3).forEach(room => {
        console.log(`- ${room.number}: ${room.type} (${room.capacity} personas) - $${room.base_price} - Piso ${room.floor} - Estado: ${room.current_status}`);
      });
    }
    
    if (data.summary) {
      console.log('\n📊 Resumen:');
      console.log(`Total: ${data.summary.total}`);
      console.log(`Disponibles: ${data.summary.available}`);
      console.log(`Ocupadas: ${data.summary.occupied}`);
      console.log(`Reservadas: ${data.summary.reserved}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testRoomsEndpoint();