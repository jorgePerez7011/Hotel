/**
 * Script para crear la tabla de empresas en la base de datos Hotel Sol
 * Uso: node setup-companies.js
 */

import db from './config/mysql.js';

const setupCompaniesTable = async () => {
  try {
    console.log('🏨 Hotel Sol - Creación de tabla de empresas');
    console.log('============================================\n');

    // Crear tabla de empresas
    console.log('📊 Creando tabla de empresas...');
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS companies (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nit VARCHAR(20) NOT NULL UNIQUE COMMENT 'Número de identificación tributaria',
        name VARCHAR(255) NOT NULL COMMENT 'Nombre de la empresa',
        description TEXT COMMENT 'Descripción o notas sobre la empresa',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización',
        INDEX idx_nit (nit),
        INDEX idx_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabla para almacenar información de empresas'
    `;

    await db.promise().query(createTableQuery);
    console.log('✅ Tabla de empresas creada correctamente\n');

    // Verificar si la tabla tiene datos
    const [existing] = await db.promise().query('SELECT COUNT(*) as count FROM companies');
    
    if (existing[0].count === 0) {
      console.log('📝 Insertando empresas de ejemplo...');
      const companies = [
        { nit: '800000000-0', name: 'SERINCO DRILLING', description: 'Empresa de perforación' },
        { nit: '800000001-1', name: 'ERAZO VALENCIA', description: 'Asesoría y consultoría' },
        { nit: '800000002-2', name: 'GRANTIERRA', description: 'Empresa agrícola' },
        { nit: '800000003-3', name: 'AMBIENCIQ', description: 'Gestión ambiental' },
        { nit: '800000004-4', name: 'BUREAU VERITAS', description: 'Auditoría y certificación' }
      ];

      for (const company of companies) {
        await db.promise().query(
          'INSERT INTO companies (nit, name, description) VALUES (?, ?, ?)',
          [company.nit, company.name, company.description]
        );
        console.log(`  ✓ ${company.name}`);
      }
      console.log('✅ Empresas de ejemplo insertadas\n');
    } else {
      console.log(`ℹ️  La tabla ya contiene ${existing[0].count} empresa(s)\n`);
    }

    // Verificar datos
    const [companies] = await db.promise().query('SELECT * FROM companies ORDER BY name');
    console.log('📊 Estado actual de empresas:');
    console.log(`Total: ${companies.length}\n`);
    companies.forEach(c => {
      console.log(`  • ${c.name} (NIT: ${c.nit})`);
    });

    console.log('\n✅ Setup completado exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante el setup:', error);
    process.exit(1);
  }
};

// Ejecutar setup
setupCompaniesTable();
