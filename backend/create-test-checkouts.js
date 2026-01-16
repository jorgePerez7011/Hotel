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

async function createTestCheckouts() {
  try {
    // Get a room ID
    const [rooms] = await pool.execute('SELECT id FROM rooms LIMIT 1');
    
    if (rooms.length === 0) {
      console.log('No rooms found');
      return;
    }

    const roomId = rooms[0].id;
    console.log('Using room ID:', roomId);

    // Create test checkouts for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkInDate = new Date(today);
    checkInDate.setDate(checkInDate.getDate() - 2);

    const checkOutDate = new Date(today);

    const testData = [
      {
        room_id: roomId,
        guest_name: 'Juan Pérez',
        guest_email: 'juan@example.com',
        guest_phone: '3001234567',
        check_in_date: checkInDate.toISOString().split('T')[0],
        check_out_date: checkOutDate.toISOString().split('T')[0],
        nights_booked: 2,
        price_per_night: 150000,
        total_amount: 300000,
        status: 'checked_out'
      },
      {
        room_id: roomId,
        guest_name: 'María García',
        guest_email: 'maria@example.com',
        guest_phone: '3007654321',
        check_in_date: checkInDate.toISOString().split('T')[0],
        check_out_date: checkOutDate.toISOString().split('T')[0],
        nights_booked: 1,
        price_per_night: 120000,
        total_amount: 120000,
        status: 'checked_out'
      },
      {
        room_id: roomId,
        guest_name: 'Carlos López',
        guest_email: 'carlos@example.com',
        guest_phone: '3005555555',
        check_in_date: checkInDate.toISOString().split('T')[0],
        check_out_date: checkOutDate.toISOString().split('T')[0],
        nights_booked: 3,
        price_per_night: 180000,
        total_amount: 540000,
        status: 'checked_out'
      }
    ];

    for (const booking of testData) {
      const [result] = await pool.execute(`
        INSERT INTO bookings (
          room_id, guest_name, guest_email, guest_phone,
          check_in_date, check_out_date, nights_booked,
          price_per_night, total_amount, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        booking.room_id,
        booking.guest_name,
        booking.guest_email,
        booking.guest_phone,
        booking.check_in_date,
        booking.check_out_date,
        booking.nights_booked,
        booking.price_per_night,
        booking.total_amount,
        booking.status
      ]);

      console.log(`✅ Created checkout for ${booking.guest_name} (ID: ${result.insertId})`);
    }

    console.log('\n✅ Test checkouts created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestCheckouts();
