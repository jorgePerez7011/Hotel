import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hotelsol',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0
});

async function checkBookings() {
  try {
    const [bookings] = await pool.execute(`
      SELECT id, room_id, guest_name, status, check_in_date, check_out_date
      FROM bookings
      ORDER BY id DESC
      LIMIT 20
    `);

    console.log('Bookings in database:');
    console.log(JSON.stringify(bookings, null, 2));
    
    console.log(`\nTotal bookings: ${bookings.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkBookings();
