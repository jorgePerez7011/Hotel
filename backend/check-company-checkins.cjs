const mysql = require('mysql2/promise');

(async () => {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hotelsol',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    console.log(`\n📅 Rango de búsqueda: ${startOfMonth.toISOString()} a ${endOfMonth.toISOString()}\n`);

    // Contar company-checkin
    const [companyCheckins] = await pool.execute(`
      SELECT COUNT(*) as count, SUM(total_amount) as total
      FROM bookings 
      WHERE created_at >= ? AND created_at <= ?
      AND payment_type = 'company_contract'
    `, [startOfMonth.toISOString(), endOfMonth.toISOString()]);

    console.log('📊 Company Checkins (payment_type = company_contract):');
    console.log(`   Cantidad: ${companyCheckins[0].count}`);
    console.log(`   Total: COP ${companyCheckins[0].total || 0}`);

    // Verificar el total actual
    const [currentTotal] = await pool.execute(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as checkout_income,
        COUNT(*) as checkout_count
      FROM bookings 
      WHERE created_at >= ? AND created_at <= ?
      AND status IN ('checked_out', 'checked_in')
    `, [startOfMonth.toISOString(), endOfMonth.toISOString()]);

    console.log('\n📊 Total actual de bookings (status IN checked_out, checked_in):');
    console.log(`   Cantidad: ${currentTotal[0].checkout_count}`);
    console.log(`   Total: COP ${currentTotal[0].checkout_income}`);

    // Obtener todos los bookings para este mes
    const [allBookings] = await pool.execute(`
      SELECT id, guest_name, payment_type, status, total_amount, created_at
      FROM bookings 
      WHERE created_at >= ? AND created_at <= ?
      ORDER BY created_at DESC
    `, [startOfMonth.toISOString(), endOfMonth.toISOString()]);

    console.log(`\n📋 Todos los bookings del mes (${allBookings.length} registros):\n`);
    allBookings.forEach((b, idx) => {
      console.log(`${idx + 1}. ${b.guest_name}`);
      console.log(`   - Status: ${b.status}`);
      console.log(`   - Tipo: ${b.payment_type || 'NULL'}`);
      console.log(`   - Total: COP ${b.total_amount}`);
      console.log(`   - Fecha: ${b.created_at}`);
      console.log();
    });

    pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    pool.end();
  }
})();
