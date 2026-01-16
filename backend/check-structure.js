import pool from './config/mysql.js';

(async () => {
  try {
    console.log('Estructura de bookings:');
    const [structure] = await pool.execute('DESCRIBE bookings');
    console.log(JSON.stringify(structure, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
