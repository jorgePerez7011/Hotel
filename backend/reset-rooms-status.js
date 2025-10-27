import pool from './config/mysql.js';

async function resetRoomStatus() {
  try {
    console.log('🔄 Reseteando estado de habitaciones...');
    
    // Primero verificar el estado actual
    const [currentStatus] = await pool.execute(`
      SELECT room_number, current_status, COUNT(*) as count 
      FROM rooms 
      GROUP BY current_status
    `);
    
    console.log('Estado actual de habitaciones:');
    currentStatus.forEach(status => {
      console.log(`- ${status.current_status}: ${status.count} habitaciones`);
    });
    
    // Resetear todas las habitaciones a disponibles
    const [result] = await pool.execute(`
      UPDATE rooms 
      SET current_status = 'available', is_available = 1 
      WHERE current_status != 'available' OR is_available != 1
    `);
    
    console.log(`✅ ${result.affectedRows} habitaciones actualizadas a disponible`);
    
    // Verificar reservas activas que podrían estar afectando el estado
    const [bookings] = await pool.execute(`
      SELECT room_id, guest_name, check_in_date, check_out_date, status 
      FROM bookings 
      WHERE status IN ('confirmed', 'checked_in')
      AND check_out_date > CURDATE()
    `);
    
    console.log(`\n📋 Reservas activas encontradas: ${bookings.length}`);
    bookings.forEach(booking => {
      console.log(`- Habitación ${booking.room_id}: ${booking.guest_name} (${booking.check_in_date} - ${booking.check_out_date}) [${booking.status}]`);
    });
    
    // Verificar estado final
    const [finalStatus] = await pool.execute(`
      SELECT room_number, current_status 
      FROM rooms 
      ORDER BY room_number
    `);
    
    console.log('\n✅ Estado final de habitaciones:');
    finalStatus.forEach(room => {
      console.log(`- ${room.room_number}: ${room.current_status}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

resetRoomStatus();