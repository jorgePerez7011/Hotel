import bcrypt from 'bcryptjs';
import pool from './config/mysql.js';

async function createTestUsers() {
    try {
        console.log('🔍 Verificando usuarios de prueba...');
        
        // Hash password for test users
        const hashedPassword = await bcrypt.hash('123456', 12);
        
        // Test users to create
        const testUsers = [
            {
                name: 'Admin Usuario',
                email: 'admin@hotelsol.com',
                password: hashedPassword,
                role: 'admin'
            },
            {
                name: 'Staff Usuario',
                email: 'staff@hotelsol.com',
                password: hashedPassword,
                role: 'staff'
            },
            {
                name: 'Guest Usuario',
                email: 'guest@hotelsol.com',
                password: hashedPassword,
                role: 'guest'
            }
        ];

        // Create users table if it doesn't exist
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role ENUM('admin', 'staff', 'guest') DEFAULT 'guest',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Insert test users
        for (const user of testUsers) {
            try {
                await pool.execute(
                    'INSERT IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                    [user.name, user.email, user.password, user.role]
                );
                console.log(`✅ Usuario creado/verificado: ${user.email}`);
            } catch (error) {
                if (error.code === 'ER_DUP_ENTRY') {
                    console.log(`ℹ️  Usuario ya existe: ${user.email}`);
                } else {
                    console.log(`❌ Error creando usuario ${user.email}:`, error.message);
                }
            }
        }

        // Create employees table if it doesn't exist and add test employee
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS employees (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                position VARCHAR(100) NOT NULL,
                phone VARCHAR(20),
                hire_date DATE,
                salary DECIMAL(10,2),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Add test employee
        try {
            await pool.execute(
                'INSERT IGNORE INTO employees (name, email, password, position, phone, hire_date, salary) VALUES (?, ?, ?, ?, ?, ?, ?)',
                ['Manager Hotel', 'manager@hotelsol.com', hashedPassword, 'manager', '+57300123456', '2025-01-01', 3000000]
            );
            console.log('✅ Empleado manager creado/verificado: manager@hotelsol.com');
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                console.log('ℹ️  Empleado manager ya existe');
            } else {
                console.log('❌ Error creando empleado manager:', error.message);
            }
        }

        console.log('\n📋 Usuarios de prueba disponibles:');
        console.log('  • admin@hotelsol.com (password: 123456) - Rol: admin');
        console.log('  • staff@hotelsol.com (password: 123456) - Rol: staff');
        console.log('  • guest@hotelsol.com (password: 123456) - Rol: guest');
        console.log('  • manager@hotelsol.com (password: 123456) - Empleado manager');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error general:', error);
        process.exit(1);
    }
}

createTestUsers();