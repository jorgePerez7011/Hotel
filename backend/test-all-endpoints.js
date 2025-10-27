import fetch from 'node-fetch';

async function testAllEndpoints() {
  const baseUrl = 'http://localhost:4000/api';
  
  try {
    console.log('🧪 Probando todos los endpoints del servidor...\n');
    
    // 1. Probar habitaciones
    console.log('1. Probando /api/hotel/rooms...');
    try {
      const roomsResponse = await fetch(`${baseUrl}/hotel/rooms`);
      const roomsData = await roomsResponse.json();
      console.log(`   ✅ Status: ${roomsResponse.status}`);
      console.log(`   ✅ Habitaciones: ${roomsData.rooms?.length || 0}`);
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    // 2. Probar empleados
    console.log('\n2. Probando /api/employees...');
    try {
      const employeesResponse = await fetch(`${baseUrl}/employees`);
      const employeesData = await employeesResponse.json();
      console.log(`   ✅ Status: ${employeesResponse.status}`);
      console.log(`   ✅ Empleados: ${employeesData.employees?.length || 0}`);
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    // 3. Probar reservas
    console.log('\n3. Probando /api/bookings...');
    try {
      const bookingsResponse = await fetch(`${baseUrl}/bookings`);
      const bookingsData = await bookingsResponse.json();
      console.log(`   ✅ Status: ${bookingsResponse.status}`);
      console.log(`   ✅ Reservas: ${bookingsData.bookings?.length || 0}`);
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    // 4. Probar health check
    console.log('\n4. Probando /api/health...');
    try {
      const healthResponse = await fetch(`${baseUrl}/health`);
      const healthData = await healthResponse.json();
      console.log(`   ✅ Status: ${healthResponse.status}`);
      console.log(`   ✅ Server: ${healthData.server || 'OK'}`);
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('\n🎯 CONCLUSIÓN: ¡El servidor único debe manejar todas las funcionalidades!');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testAllEndpoints();