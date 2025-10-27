import mysql from 'mysql2/promise';

// Configuración de la base de datos
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'hotelsol'
};

async function setupRoomsSimple() {
  let connection;
  
  try {
    console.log('🔄 Conectando a la base de datos...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado a MySQL');

    console.log('🏨 Configurando 20 habitaciones del Hotel Sol...');
    console.log('===============================================');

    // Habitaciones Piso 1 (101-109) - Estándar
    console.log('🏢 PISO 1 - Habitaciones Estándar:');
    for (let i = 101; i <= 109; i++) {
      try {
        await connection.execute(`
          INSERT INTO rooms (room_number, type, capacity, price_per_night) 
          VALUES (?, 'standard', 2, 80.00)
        `, [i.toString()]);
        console.log(`✅ Habitación ${i} - Estándar - $80/noche`);
      } catch (error) {
        console.log(`❌ Error con habitación ${i}:`, error.message);
      }
    }

    // Habitaciones Piso 2 (201-211) - Ejecutivas
    console.log('\n🏢 PISO 2 - Habitaciones Ejecutivas:');
    for (let i = 201; i <= 211; i++) {
      try {
        await connection.execute(`
          INSERT INTO rooms (room_number, type, capacity, price_per_night) 
          VALUES (?, 'executive', 2, 120.00)
        `, [i.toString()]);
        console.log(`✅ Habitación ${i} - Ejecutiva - $120/noche`);
      } catch (error) {
        console.log(`❌ Error con habitación ${i}:`, error.message);
      }
    }

    // Verificar habitaciones creadas
    const [rooms] = await connection.execute(`
      SELECT room_number, type, price_per_night, capacity, is_available 
      FROM rooms 
      ORDER BY room_number ASC
    `);

    console.log('\n📊 RESUMEN:');
    console.log('===========');
    console.log(`🏨 Total habitaciones creadas: ${rooms.length}`);
    
    const piso1 = rooms.filter(r => r.room_number.startsWith('1')).length;
    const piso2 = rooms.filter(r => r.room_number.startsWith('2')).length;
    const standard = rooms.filter(r => r.type === 'standard').length;
    const executive = rooms.filter(r => r.type === 'executive').length;
    
    console.log(`🏢 Piso 1: ${piso1} habitaciones`);
    console.log(`🏢 Piso 2: ${piso2} habitaciones`);
    console.log(`📋 Estándar: ${standard} habitaciones`);
    console.log(`📋 Ejecutivas: ${executive} habitaciones`);

    console.log('\n✅ CONFIGURACIÓN COMPLETADA');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔐 Conexión cerrada');
    }
  }
}

// Ejecutar configuración
setupRoomsSimple().catch(console.error);