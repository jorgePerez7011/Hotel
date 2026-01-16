import pool from './config/mysql.js';

const addSelectedRoomsColumn = async () => {
  try {
    console.log('🔄 Agregando columna selected_rooms a la tabla shift_handovers...');

    const connection = await pool.getConnection();

    // Verificar si la columna ya existe
    const [columns] = await connection.execute(`
      SHOW COLUMNS FROM shift_handovers LIKE 'selected_rooms'
    `);

    if (columns.length === 0) {
      // Agregar la columna selected_rooms
      await connection.execute(`
        ALTER TABLE shift_handovers
        ADD COLUMN selected_rooms JSON AFTER pending_checkins
      `);

      console.log('✅ Columna selected_rooms agregada exitosamente');
    } else {
      console.log('ℹ️ La columna selected_rooms ya existe');
    }

    connection.release();
    console.log('✅ Actualización completada');

  } catch (error) {
    console.error('❌ Error actualizando tabla:', error);
  }
};

addSelectedRoomsColumn();