import pool from './config/mysql.js';

async function addCompanyColumns() {
  try {
    console.log('Verificando columnas de empresas en tabla bookings...\n');

    // Verificar estructura actual
    const [columns] = await pool.execute('DESCRIBE bookings');
    const columnNames = columns.map(col => col.Field);

    console.log('Columnas existentes:');
    columnNames.forEach(col => console.log(`- ${col}`));
    console.log();

    // Agregar columna guest_identification si no existe
    if (!columnNames.includes('guest_identification')) {
      console.log('Agregando columna guest_identification...');
      await pool.execute(`
        ALTER TABLE bookings 
        ADD COLUMN guest_identification VARCHAR(50) NULL AFTER guest_phone
      `);
      console.log('✓ Columna guest_identification agregada\n');
    } else {
      console.log('✓ Columna guest_identification ya existe\n');
    }

    // Agregar columnas si no existen
    if (!columnNames.includes('company_id')) {
      console.log('Agregando columna company_id...');
      await pool.execute(`
        ALTER TABLE bookings 
        ADD COLUMN company_id INT NULL AFTER guest_identification
      `);
      console.log('✓ Columna company_id agregada\n');
    } else {
      console.log('✓ Columna company_id ya existe\n');
    }

    if (!columnNames.includes('company_name')) {
      console.log('Agregando columna company_name...');
      await pool.execute(`
        ALTER TABLE bookings 
        ADD COLUMN company_name VARCHAR(255) NULL AFTER company_id
      `);
      console.log('✓ Columna company_name agregada\n');
    } else {
      console.log('✓ Columna company_name ya existe\n');
    }

    if (!columnNames.includes('payment_type')) {
      console.log('Agregando columna payment_type...');
      await pool.execute(`
        ALTER TABLE bookings 
        ADD COLUMN payment_type VARCHAR(50) DEFAULT 'direct' AFTER status
      `);
      console.log('✓ Columna payment_type agregada\n');
    } else {
      console.log('✓ Columna payment_type ya existe\n');
    }

    // Mostrar estructura final
    const [updatedColumns] = await pool.execute('DESCRIBE bookings');
    console.log('Estructura final de bookings:');
    updatedColumns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    console.log('\n✓ Todas las columnas han sido verificadas/agregadas exitosamente');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

addCompanyColumns();
