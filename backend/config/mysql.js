import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hotelsol',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection function
export const connectMySQL = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('MySQL connected successfully to database:', process.env.DB_NAME);
    
    // Create tables if they don't exist
    await initializeTables(connection);
    
    connection.release();
    return true;
  } catch (error) {
    console.error('MySQL connection error:', error.message);
    throw error;
  }
};

// Initialize database tables
const initializeTables = async (connection) => {
  try {
    // Users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'guest',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Rooms table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS rooms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_number VARCHAR(10) UNIQUE NOT NULL,
        type VARCHAR(50) NOT NULL,
        price_per_night DECIMAL(10, 2) NOT NULL,
        capacity INT NOT NULL,
        amenities JSON,
        is_available BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Bookings table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        room_id INT,
        check_in_date DATE NOT NULL,
        check_out_date DATE NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
      )
    `);

    // Employees table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS employees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        position ENUM('admin', 'aseadora', 'recepcionista') NOT NULL,
        salary DECIMAL(10, 2),
        hire_date DATE NOT NULL,
        is_active BOOLEAN DEFAULT true,
        shift VARCHAR(50) DEFAULT 'mañana',
        emergency_contact VARCHAR(255),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert sample rooms if the table is empty
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM rooms');
    if (rows[0].count === 0) {
      await insertSampleRooms(connection);
    }

    // Insert sample employees if the table is empty
    const [employeeRows] = await connection.execute('SELECT COUNT(*) as count FROM employees');
    if (employeeRows[0].count === 0) {
      await insertSampleEmployees(connection);
    }

    console.log('MySQL tables initialized successfully');
  } catch (error) {
    console.error('Error initializing MySQL tables:', error.message);
    throw error;
  }
};

// Insert sample rooms for demonstration
const insertSampleRooms = async (connection) => {
  try {
    const sampleRooms = [
      ['101', 'single', 80.00, 1, JSON.stringify(['WiFi', 'TV', 'AC'])],
      ['102', 'double', 120.00, 2, JSON.stringify(['WiFi', 'TV', 'AC', 'Minibar'])],
      ['201', 'suite', 200.00, 4, JSON.stringify(['WiFi', 'TV', 'AC', 'Minibar', 'Jacuzzi'])],
      ['202', 'double', 120.00, 2, JSON.stringify(['WiFi', 'TV', 'AC'])],
      ['301', 'deluxe', 300.00, 2, JSON.stringify(['WiFi', 'TV', 'AC', 'Minibar', 'Balcón', 'Vista al mar'])]
    ];

    for (const room of sampleRooms) {
      await connection.execute(
        'INSERT INTO rooms (room_number, type, price_per_night, capacity, amenities) VALUES (?, ?, ?, ?, ?)',
        room
      );
    }

    console.log('Sample rooms inserted successfully');
  } catch (error) {
    console.error('Error inserting sample rooms:', error.message);
  }
};

// Insert sample employees for demonstration (with plain text passwords for demo)
const insertSampleEmployees = async (connection) => {
  try {
    const sampleEmployees = [
      ['Administrador', 'admin@hotelsol.com', '+1-555-0001', 'admin', 2500.00, '2023-01-01', 'completo', 'N/A', 'Hotel Sol - Oficina Principal', 'admin123'],
      ['María González', 'maria.gonzalez@hotelsol.com', '+1-555-0101', 'recepcionista', 1200.00, '2023-01-15', 'mañana', 'Carlos González +1-555-0102', 'Calle Principal 123, Ciudad', 'maria123'],
      ['Ana Martínez', 'ana.martinez@hotelsol.com', '+1-555-0201', 'aseadora', 900.00, '2023-02-20', 'mañana', 'Luis Martínez +1-555-0202', 'Av. Secundaria 456, Ciudad', 'ana123'],
      ['Carmen López', 'carmen.lopez@hotelsol.com', '+1-555-0301', 'aseadora', 900.00, '2023-03-10', 'tarde', 'Pedro López +1-555-0302', 'Calle Tercera 789, Ciudad', 'carmen123'],
      ['Sofia Rodríguez', 'sofia.rodriguez@hotelsol.com', '+1-555-0401', 'recepcionista', 1200.00, '2023-04-05', 'noche', 'Miguel Rodríguez +1-555-0402', 'Boulevard Central 321, Ciudad', 'sofia123']
    ];

    for (const employee of sampleEmployees) {
      await connection.execute(
        'INSERT INTO employees (name, email, phone, position, salary, hire_date, shift, emergency_contact, address, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        employee
      );
    }

    console.log('Sample employees inserted successfully');
  } catch (error) {
    console.error('Error inserting sample employees:', error.message);
  }
};

// Export the pool for use in other modules
export default pool;