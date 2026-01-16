import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function clearInventory() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hotel_system'
    });

    console.log('🗑️  Eliminando todo el inventario...\n');

    // Eliminar todos los items del inventario
    const [result] = await connection.execute('DELETE FROM inventory_items');
    console.log(`✅ Items del inventario eliminados: ${result.affectedRows}`);

    // Eliminar todas las categorías de inventario
    const [categoryResult] = await connection.execute('DELETE FROM inventory_categories');
    console.log(`✅ Categorías de inventario eliminadas: ${categoryResult.affectedRows}`);

    // Verificar que quedó vacío
    const [itemsCheck] = await connection.execute('SELECT COUNT(*) as count FROM inventory_items');
    const [categoriesCheck] = await connection.execute('SELECT COUNT(*) as count FROM inventory_categories');

    console.log('\n📊 Estado final:');
    console.log(`   - Items en inventario: ${itemsCheck[0].count}`);
    console.log(`   - Categorías: ${categoriesCheck[0].count}`);

    if (itemsCheck[0].count === 0 && categoriesCheck[0].count === 0) {
      console.log('\n✅ ¡Inventario completamente vacío!');
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Error eliminando inventario:', error.message);
    process.exit(1);
  }
}

clearInventory();
