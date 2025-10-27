import mysql from 'mysql2/promise';

// Configuración de la base de datos
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'hotelsol'
};

async function createSampleBookings() {
  let connection;
  
  try {
    console.log('🔄 Conectando a la base de datos...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado a MySQL');

    // Verificar si existe la tabla bookings
    console.log('🔍 Verificando tabla bookings...');
    try {
      await connection.execute('DESCRIBE bookings');
      console.log('✅ Tabla bookings encontrada');
    } catch (error) {
      console.log('🔄 Creando tabla bookings...');
      
      // Crear tabla bookings
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS bookings (
          id INT PRIMARY KEY AUTO_INCREMENT,
          room_id INT NOT NULL,
          guest_name VARCHAR(255) NOT NULL,
          guest_email VARCHAR(255),
          guest_phone VARCHAR(50),
          check_in_date DATE NOT NULL,
          check_out_date DATE NOT NULL,
          total_amount DECIMAL(10,2) NOT NULL,
          status ENUM('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled') DEFAULT 'pending',
          payment_status ENUM('pending', 'partial', 'paid', 'refunded') DEFAULT 'pending',
          special_requests TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
          INDEX idx_dates (check_in_date, check_out_date),
          INDEX idx_status (status),
          INDEX idx_room (room_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      
      console.log('✅ Tabla bookings creada');
    }

    // Limpiar bookings existentes
    await connection.execute('DELETE FROM bookings');
    console.log('🗑️  Bookings anteriores eliminados');

    // Actualizar tabla bookings con campos necesarios
    console.log('🔄 Actualizando tabla bookings...');
    
    // Agregar campos que faltan
    try {
      await connection.execute('ALTER TABLE bookings ADD COLUMN guest_name VARCHAR(255) AFTER room_id');
    } catch (error) {
      console.log('Campo guest_name ya existe o error:', error.message);
    }
    
    try {
      await connection.execute('ALTER TABLE bookings ADD COLUMN guest_email VARCHAR(255) AFTER guest_name');
    } catch (error) {
      console.log('Campo guest_email ya existe o error:', error.message);
    }
    
    try {
      await connection.execute('ALTER TABLE bookings ADD COLUMN guest_phone VARCHAR(50) AFTER guest_email');
    } catch (error) {
      console.log('Campo guest_phone ya existe o error:', error.message);
    }

    // Obtener habitaciones disponibles
    const [rooms] = await connection.execute('SELECT id, room_number, type, price_per_night FROM rooms ORDER BY id LIMIT 10');
    
    if (rooms.length === 0) {
      console.log('❌ No hay habitaciones disponibles. Ejecuta primero setup-real-rooms.js');
      return;
    }

    console.log(`📋 Encontradas ${rooms.length} habitaciones`);

    // Crear reservas de ejemplo
    const today = new Date();
    const bookingsData = [];

    // Reservas actuales (ocupadas)
    for (let i = 0; i < 5; i++) {
      const room = rooms[i];
      const checkIn = new Date(today);
      checkIn.setDate(today.getDate() - 1); // Ayer
      
      const checkOut = new Date(today);
      checkOut.setDate(today.getDate() + 2); // Pasado mañana
      
      const nights = 3;
      const totalAmount = room.price_per_night * nights;

      bookingsData.push({
        room_id: room.id,
        guest_name: `Huésped ${i + 1}`,
        guest_email: `huesped${i + 1}@email.com`,
        guest_phone: `555-000${i + 1}`,
        check_in_date: checkIn.toISOString().split('T')[0],
        check_out_date: checkOut.toISOString().split('T')[0],
        total_amount: totalAmount,
        status: 'checked_in'
      });
    }

    // Reservas futuras (reservadas)
    for (let i = 5; i < 8; i++) {
      const room = rooms[i];
      const checkIn = new Date(today);
      checkIn.setDate(today.getDate() + 2); // Pasado mañana
      
      const checkOut = new Date(today);
      checkOut.setDate(today.getDate() + 5); // En 5 días
      
      const nights = 3;
      const totalAmount = room.price_per_night * nights;

      bookingsData.push({
        room_id: room.id,
        guest_name: `Reserva ${i - 4}`,
        guest_email: `reserva${i - 4}@email.com`,
        guest_phone: `555-100${i - 4}`,
        check_in_date: checkIn.toISOString().split('T')[0],
        check_out_date: checkOut.toISOString().split('T')[0],
        total_amount: totalAmount,
        status: 'confirmed'
      });
    }

    // Insertar bookings
    console.log('🔄 Insertando reservas de ejemplo...');
    
    for (const booking of bookingsData) {
      await connection.execute(`
        INSERT INTO bookings (room_id, guest_name, guest_email, guest_phone, check_in_date, check_out_date, total_amount, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        booking.room_id,
        booking.guest_name,
        booking.guest_email,
        booking.guest_phone,
        booking.check_in_date,
        booking.check_out_date,
        booking.total_amount,
        booking.status
      ]);
    }

    console.log(`✅ ${bookingsData.length} reservas insertadas`);

    // Verificar resultado
    const [occupiedRooms] = await connection.execute(`
      SELECT COUNT(*) as occupied FROM bookings 
      WHERE status = 'checked_in' 
      AND check_in_date <= CURDATE() 
      AND check_out_date > CURDATE()
    `);

    const [reservedRooms] = await connection.execute(`
      SELECT COUNT(*) as reserved FROM bookings 
      WHERE status = 'confirmed' 
      AND check_in_date > CURDATE()
    `);

    const [totalRooms] = await connection.execute('SELECT COUNT(*) as total FROM rooms');

    console.log('\n📊 RESUMEN DE OCUPACIÓN:');
    console.log('======================');
    console.log(`🏨 Total habitaciones: ${totalRooms[0].total}`);
    console.log(`🔴 Habitaciones ocupadas: ${occupiedRooms[0].occupied}`);
    console.log(`🔵 Habitaciones reservadas: ${reservedRooms[0].reserved}`);
    console.log(`🟢 Habitaciones disponibles: ${totalRooms[0].total - occupiedRooms[0].occupied}`);
    
    const occupancyRate = Math.round((occupiedRooms[0].occupied / totalRooms[0].total) * 100);
    console.log(`📈 Tasa de ocupación: ${occupancyRate}%`);

    console.log('\n🎉 DATOS DE EJEMPLO CREADOS EXITOSAMENTE');
    console.log('======================================');
    console.log('✅ Reservas de ejemplo insertadas');
    console.log('✅ Sistema listo para pruebas');
    console.log('✅ Gestión de habitaciones funcional');

    // Mostrar algunas reservas
    const [sampleBookings] = await connection.execute(`
      SELECT b.*, r.room_number, r.type 
      FROM bookings b 
      JOIN rooms r ON b.room_id = r.id 
      ORDER BY b.check_in_date 
      LIMIT 5
    `);

    console.log('\n📋 EJEMPLOS DE RESERVAS:');
    console.log('=======================');
    sampleBookings.forEach(booking => {
      console.log(`🏠 Habitación ${booking.room_number} (${booking.type}) - ${booking.guest_name} - ${booking.status} - $${booking.total_amount}`);
    });

  } catch (error) {
    console.error('❌ Error creando datos de ejemplo:', error.message);
    console.error('📍 Stack:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔐 Conexión cerrada');
    }
  }
}

// Ejecutar creación
createSampleBookings().catch(console.error);