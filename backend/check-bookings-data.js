import pool from './config/mysql.js';

(async () => {
  try {
    console.log('Verificando datos de bookings...');
    
    // Verificar bookings con status checked_out o checked_in
    const [result] = await pool.execute(`
      SELECT COUNT(*) as total FROM bookings 
      WHERE status IN ('checked_out', 'checked_in')
    `);
    
    console.log('Total de bookings con status checked_out/checked_in:', result[0].total);
    
    // Obtener algunos ejemplos
    const [examples] = await pool.execute(`
      SELECT id, room_number, guest_name, status, total_amount, check_in_date, check_out_date 
      FROM bookings 
      WHERE status IN ('checked_out', 'checked_in')
      LIMIT 5
    `);
    
    console.log('Ejemplos de bookings:', examples);
    
    // Verificar entregas de turno
    const [handovers] = await pool.execute(`
      SELECT COUNT(*) as total FROM shift_handovers 
      WHERE status = 'completed'
    `);
    
    console.log('Total de entregas completadas:', handovers[0].total);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
