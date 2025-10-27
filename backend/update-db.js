import pool from './config/mysql.js';

const updateDatabase = async () => {
  try {
    console.log('🔄 Actualizando base de datos...');
    
    // Obtener conexión
    const connection = await pool.getConnection();
    
    // Primero, verificar si la columna password existe
    try {
      const [columns] = await connection.execute(`
        SHOW COLUMNS FROM employees LIKE 'password'
      `);
      
      if (columns.length === 0) {
        // Agregar columna password si no existe
        await connection.execute(`
          ALTER TABLE employees ADD COLUMN password VARCHAR(255) AFTER email
        `);
        console.log('✅ Columna password agregada');
      }
      
      // Actualizar ENUM para incluir 'admin'
      await connection.execute(`
        ALTER TABLE employees MODIFY COLUMN position ENUM('admin', 'aseadora', 'recepcionista') NOT NULL
      `);
      console.log('✅ ENUM actualizado');
      
    } catch (alterError) {
      console.log('⚠️ Error al modificar tabla:', alterError.message);
    }
    
    // Limpiar datos existentes
    await connection.execute('DELETE FROM employees');
    console.log('✅ Datos existentes eliminados');
    
    // Insertar nuevos datos con contraseñas
    const sampleEmployees = [
      ['Administrador', 'admin@hotelsol.com', 'admin123', '+1-555-0001', 'admin', 2500.00, '2023-01-01', 'completo', 'N/A', 'Hotel Sol - Oficina Principal'],
      ['María González', 'maria.gonzalez@hotelsol.com', 'maria123', '+1-555-0101', 'recepcionista', 1200.00, '2023-01-15', 'mañana', 'Carlos González +1-555-0102', 'Calle Principal 123, Ciudad'],
      ['Ana Martínez', 'ana.martinez@hotelsol.com', 'ana123', '+1-555-0201', 'aseadora', 900.00, '2023-02-20', 'mañana', 'Luis Martínez +1-555-0202', 'Av. Secundaria 456, Ciudad'],
      ['Carmen López', 'carmen.lopez@hotelsol.com', 'carmen123', '+1-555-0301', 'aseadora', 900.00, '2023-03-10', 'tarde', 'Pedro López +1-555-0302', 'Calle Tercera 789, Ciudad'],
      ['Sofia Rodríguez', 'sofia.rodriguez@hotelsol.com', 'sofia123', '+1-555-0401', 'recepcionista', 1200.00, '2023-04-05', 'noche', 'Miguel Rodríguez +1-555-0402', 'Boulevard Central 321, Ciudad']
    ];

    for (const employee of sampleEmployees) {
      await connection.execute(
        'INSERT INTO employees (name, email, password, phone, position, salary, hire_date, shift, emergency_contact, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        employee
      );
    }
    
    console.log('✅ Empleados insertados con credenciales de login');
    console.log('\n🔑 Credenciales de acceso:');
    console.log('Admin: admin@hotelsol.com / admin123');
    console.log('Recepcionista: maria.gonzalez@hotelsol.com / maria123');
    console.log('Aseadora: ana.martinez@hotelsol.com / ana123');
    
    connection.release();
    console.log('✅ Base de datos actualizada correctamente');
    
  } catch (error) {
    console.error('❌ Error actualizando base de datos:', error);
  }
  
  process.exit(0);
};

updateDatabase();