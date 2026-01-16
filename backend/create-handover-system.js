import pool from './config/mysql.js';

const createShiftHandoverTable = async () => {
  try {
    console.log('🔄 Creando tabla para entrega de turnos...');
    
    const connection = await pool.getConnection();
    
    // Crear tabla de entrega de turnos
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS shift_handovers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        outgoing_employee_id INT NOT NULL,
        incoming_employee_id INT NOT NULL,
        shift_date DATE NOT NULL,
        outgoing_shift ENUM('mañana', 'tarde', 'noche', 'completo') NOT NULL,
        incoming_shift ENUM('mañana', 'tarde', 'noche', 'completo') NOT NULL,
        handover_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        -- Información operativa
        rooms_occupied INT DEFAULT 0,
        rooms_available INT DEFAULT 0,
        pending_checkouts INT DEFAULT 0,
        pending_checkins INT DEFAULT 0,
        selected_rooms JSON,
        
        -- Observaciones y novedades
        general_notes TEXT,
        maintenance_issues TEXT,
        guest_requests TEXT,
        inventory_notes TEXT,
        
        -- Estado y validación
        status ENUM('pending', 'completed', 'reviewed') DEFAULT 'pending',
        outgoing_signature VARCHAR(255),
        incoming_signature VARCHAR(255),
        supervisor_approval_id INT,
        approval_time DATETIME,
        
        -- Metadatos
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        -- Foreign keys
        FOREIGN KEY (outgoing_employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (incoming_employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (supervisor_approval_id) REFERENCES employees(id) ON DELETE SET NULL,
        
        -- Indices para optimizar consultas
        INDEX idx_shift_date (shift_date),
        INDEX idx_outgoing_employee (outgoing_employee_id),
        INDEX idx_incoming_employee (incoming_employee_id),
        INDEX idx_status (status)
      )
    `);
    
    console.log('✅ Tabla shift_handovers creada exitosamente');
    
    // Insertar algunos registros de ejemplo (usando IDs reales)
    const sampleHandovers = [
      [
        7, 8, '2025-10-14', 'mañana', 'tarde', '2025-10-14 14:00:00',
        18, 2, 3, 5,
        'Turno tranquilo. Habitación 205 reportó problema con AC.',
        'AC habitación 205 necesita revisión técnica',
        'Huésped habitación 301 solicita cama extra',
        'Inventario de toallas bajo, solicitar reposición',
        'completed', 'Maria_Gonzalez_2025-10-14', 'Ana_Martinez_2025-10-14', null, null
      ],
      [
        9, 10, '2025-10-13', 'tarde', 'noche', '2025-10-13 22:00:00',
        15, 5, 2, 1,
        'Llegada de grupo de 8 personas para habitaciones 201-204.',
        'Todo en orden, no hay problemas técnicos',
        'Grupo en 201-204 pidió servicio de despertador 6:00 AM',
        'Provisiones completas',
        'completed', 'Carmen_Lopez_2025-10-13', 'Sofia_Rodriguez_2025-10-13', 6, '2025-10-14 08:00:00'
      ]
    ];

    for (const handover of sampleHandovers) {
      await connection.execute(`
        INSERT INTO shift_handovers 
        (outgoing_employee_id, incoming_employee_id, shift_date, outgoing_shift, incoming_shift, handover_time,
         rooms_occupied, rooms_available, pending_checkouts, pending_checkins,
         general_notes, maintenance_issues, guest_requests, inventory_notes,
         status, outgoing_signature, incoming_signature, supervisor_approval_id, approval_time)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, handover);
    }
    
    console.log('✅ Registros de ejemplo insertados');
    
    // Mostrar estadísticas
    const [count] = await connection.execute('SELECT COUNT(*) as total FROM shift_handovers');
    console.log(`📊 Total de entregas de turno registradas: ${count[0].total}`);
    
    connection.release();
    console.log('✅ Sistema de entrega de turnos configurado correctamente');
    
  } catch (error) {
    console.error('❌ Error creando sistema de entrega de turnos:', error);
  }
  
  process.exit(0);
};

createShiftHandoverTable();