import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

// Función para actualizar URLs en archivos
function updatePortInFiles() {
  console.log('🔧 Actualizando URLs del puerto 4001 al 4000...\n');
  
  // Buscar todos los archivos Vue
  const files = [
    'src/components/vue/HotelBooking.vue',
    'src/components/vue/RoomSelection.vue', 
    'src/components/vue/EmployeeManagement.vue',
    'src/components/vue/LoginForm.vue',
    'src/components/vue/AuthGuard.vue',
    'src/components/vue/RegisterForm.vue',
    'src/components/vue/ShiftHandover.vue',
    'src/components/vue/ShiftHandoverFinancial.vue'
  ];
  
  let totalChanges = 0;
  
  files.forEach(file => {
    try {
      console.log(`📝 Procesando: ${file}`);
      let content = readFileSync(file, 'utf8');
      const originalContent = content;
      
      // Reemplazar todas las ocurrencias de localhost:4001 con localhost:4000
      content = content.replace(/localhost:4001/g, 'localhost:4000');
      
      if (content !== originalContent) {
        writeFileSync(file, content);
        const changes = (originalContent.match(/localhost:4001/g) || []).length;
        console.log(`   ✅ ${changes} URL(s) actualizadas`);
        totalChanges += changes;
      } else {
        console.log('   ℹ️  No se encontraron URLs para cambiar');
      }
    } catch (error) {
      console.log(`   ❌ Error procesando ${file}:`, error.message);
    }
  });
  
  console.log(`\n🎉 ¡Completado! ${totalChanges} URLs actualizadas en total`);
  console.log('✨ Ahora todas las URLs apuntan al puerto 4000');
}

updatePortInFiles();