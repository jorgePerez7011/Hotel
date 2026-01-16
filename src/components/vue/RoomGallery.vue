<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Top Bar -->
    <div class="bg-white border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between py-2">
          <!-- Left side - Social Media -->
          <div class="flex items-center space-x-3">
            <span class="text-sm text-gray-600">Síguenos:</span>
            <a href="#" class="text-gray-500 hover:text-blue-600 transition-colors">
              <i class="fab fa-instagram"></i>
            </a>
            <a href="#" class="text-gray-500 hover:text-blue-600 transition-colors">
              <i class="fab fa-facebook"></i>
            </a>
            <a href="#" class="text-gray-500 hover:text-blue-600 transition-colors">
              <i class="fab fa-twitter"></i>
            </a>
          </div>
          
          <!-- Center - Hotel Name -->
          <div class="text-xl font-bold text-gray-800 tracking-wider">
            HOTEL SOL
          </div>
          
          <!-- Right side - Phone -->
          <div class="flex items-center text-blue-600">
            <i class="fas fa-phone mr-2"></i>
            <span class="font-medium">+1 (234) 567-8900</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Navigation -->
    <nav class="bg-gray-800 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-center space-x-12 py-4">
          <a 
            href="/"
            class="text-white hover:text-blue-300 transition-colors font-medium px-3 py-2 rounded"
          >
            Inicio
          </a>
          <a 
            href="/about"
            class="text-white hover:text-blue-300 transition-colors font-medium px-3 py-2 rounded"
          >
            Nosotros
          </a>
          <a 
            href="/rooms"
            class="text-blue-300 font-semibold px-3 py-2 bg-gray-700 rounded"
          >
            Habitaciones
          </a>
          <a 
            href="/services"
            class="text-white hover:text-blue-300 transition-colors font-medium px-3 py-2 rounded"
          >
            Servicios
          </a>
          <a 
            href="/admin/dashboard"
            class="text-white hover:text-blue-300 transition-colors font-medium px-3 py-2 rounded"
          >
            Panel Admin
          </a>
        </div>
      </div>
    </nav>

    <!-- Galería de Habitaciones -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="space-y-16">
        
        

        <!-- Habitación Doble - Imagen a la izquierda -->
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div class="lg:flex lg:items-center">
            <!-- Imagen izquierda -->
            <div class="lg:w-1/2">
              <div class="relative h-80 lg:h-96">
                <img 
                  src="/Fotos/Habitaciones/Doble.jpg" 
                  alt="Habitación Doble"
                  class="w-full h-full object-cover"
                >
              </div>
            </div>
            <!-- Contenido derecha -->
            <div class="lg:w-1/2 p-8 lg:p-12">
              <div class="mb-4">
                <span class="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  Estándar
                </span>
              </div>
              <h2 class="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
                Habitación<br>
                <span class="text-green-600">Doble</span>
              </h2>
              <p class="text-gray-600 text-lg mb-6 leading-relaxed">
                Habitación cómoda con cama matrimonial, perfecta para parejas. Incluye todas las 
                comodidades básicas para una estancia placentera y relajante.
              </p>
              <div class="mb-8">
                <div class="flex flex-wrap gap-3">
                  <span class="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">Cama Matrimonial</span>
                  <span class="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">2 Personas</span>
                  <span class="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">Confort</span>
                </div>
              </div>
              <button 
                @click="openBookingForm('Doble')"
                class="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition-colors font-semibold text-lg"
              >
                Reservar
              </button>
            </div>
          </div>
        </div>

        <!-- Habitación Sencilla - Imagen a la derecha -->
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div class="lg:flex lg:items-center">
            <!-- Contenido izquierda -->
            <div class="lg:w-1/2 p-8 lg:p-12">
              <div class="mb-4">
                <span class="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  Sencilla
                </span>
              </div>
              <h2 class="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
                Habitación<br>
                <span class="text-blue-600">Sencilla</span>
              </h2>
              <p class="text-gray-600 text-lg mb-6 leading-relaxed">
                Habitación individual perfecta para viajeros de negocios o personas que buscan 
                comodidad y funcionalidad en un espacio optimizado y acogedor.
              </p>
              <div class="mb-8">
                <div class="flex flex-wrap gap-3">
                  <span class="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">Cama Individual</span>
                  <span class="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">1 Persona</span>
                  <span class="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">Funcional</span>
                </div>
              </div>
              <button 
                @click="openBookingForm('Sencilla')"
                class="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold text-lg"
              >
                Reservar
              </button>
            </div>
            <!-- Imagen derecha -->
            <div class="lg:w-1/2">
              <div class="relative h-80 lg:h-96">
                <img 
                  src="/Fotos/Habitaciones/Sencilla.jpg" 
                  alt="Habitación Sencilla"
                  class="w-full h-full object-cover"
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Habitación Familiar - Imagen a la izquierda -->
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div class="lg:flex lg:items-center">
            <!-- Imagen izquierda -->
            <div class="lg:w-1/2">
              <div class="relative h-80 lg:h-96">
                <img 
                  src="/Fotos/Habitaciones/Familiar.jpg" 
                  alt="Habitación Familiar"
                  class="w-full h-full object-cover"
                >
              </div>
            </div>
            <!-- Contenido derecha -->
            <div class="lg:w-1/2 p-8 lg:p-12">
              <div class="mb-4">
                <span class="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  Familiar
                </span>
              </div>
              <h2 class="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
                Habitación<br>
                <span class="text-red-600">Familiar</span>
              </h2>
              <p class="text-gray-600 text-lg mb-6 leading-relaxed">
                Amplia habitación diseñada para familias, con espacio suficiente para padres e hijos. 
                Incluye área de estar y múltiples camas para el máximo confort familiar.
              </p>
              <div class="mb-8">
                <div class="flex flex-wrap gap-3">
                  <span class="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-medium">Múltiples Camas</span>
                  <span class="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-medium">Área de Estar</span>
                  <span class="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-medium">4-6 Personas</span>
                </div>
              </div>
              <button 
                @click="openBookingForm('Familiar')"
                class="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold text-lg"
              >
                Reservar Familiar
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Modal de Reserva -->
    <div 
      v-if="showBookingModal" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click="closeBookingForm"
    >
      <div 
        class="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <!-- Header del Modal -->
        <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
          <div class="flex items-center justify-between">
            <h3 class="text-2xl font-bold">Reservar Habitación</h3>
            <button 
              @click="closeBookingForm"
              class="text-white hover:text-gray-200 text-xl"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
          <p class="text-blue-100 mt-1">{{ selectedRoomType }}</p>
        </div>

        <!-- Formulario -->
        <form @submit.prevent="submitBooking" class="p-6">
          <!-- Nombre -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              TU NOMBRE
            </label>
            <input
              v-model="bookingForm.name"
              type="text"
              required
              placeholder="Tu Nombre Completo"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
          </div>

          <!-- Email -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              CORREO ELECTRÓNICO
            </label>
            <input
              v-model="bookingForm.email"
              type="email"
              required
              placeholder="tu.correo@ejemplo.com"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
          </div>

          <!-- Teléfono -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              NÚMERO DE TELÉFONO
            </label>
            <input
              v-model="bookingForm.phone"
              type="tel"
              required
              placeholder="+57 317 6388290 - 323 3928158"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
          </div>

          <!-- Fechas -->
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                LLEGADA
              </label>
              <input
                v-model="bookingForm.checkIn"
                type="date"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                SALIDA
              </label>
              <input
                v-model="bookingForm.checkOut"
                type="date"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
            </div>
          </div>

          <!-- Huéspedes -->
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                ADULTOS
              </label>
              <select
                v-model="bookingForm.adults"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                NIÑOS
              </label>
              <select
                v-model="bookingForm.children"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </div>
          </div>

          <!-- Comentarios -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              SOLICITUDES ESPECIALES (Opcional)
            </label>
            <textarea
              v-model="bookingForm.comments"
              rows="3"
              placeholder="Cualquier solicitud especial o comentarios..."
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            ></textarea>
          </div>

          <!-- Botón -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
            {{ loading ? 'Verificando Disponibilidad...' : 'Verificar Disponibilidad' }}
          </button>
        </form>
      </div>
    </div>

    <!-- Footer Section -->
    <div class="bg-gray-800 text-white py-8 mt-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h3 class="text-2xl font-bold mb-4">Hotel Sol</h3>
          <p class="text-gray-300 mb-4">
            Experimente el lujo y la comodidad en nuestras elegantes habitaciones
          </p>
          <div class="flex justify-center space-x-6">
            <span class="text-gray-400"><i class="fas fa-phone mr-2"></i>+1 (555) 123-4567</span>
            <span class="text-gray-400"><i class="fas fa-envelope mr-2"></i>reservas@hotelsol.com</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Estado del modal de reserva
const showBookingModal = ref(false);
const selectedRoomType = ref('');
const loading = ref(false);

// Formulario de reserva
const bookingForm = ref({
  name: '',
  email: '',
  phone: '',
  checkIn: '',
  checkOut: '',
  adults: '1',
  children: '0',
  comments: ''
});

// Función para abrir el formulario de reserva
const openBookingForm = (roomType) => {
  selectedRoomType.value = roomType;
  showBookingModal.value = true;
  
  // Set default dates (today and tomorrow)
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  bookingForm.value.checkIn = today.toISOString().split('T')[0];
  bookingForm.value.checkOut = tomorrow.toISOString().split('T')[0];
};

// Función para cerrar el formulario
const closeBookingForm = () => {
  showBookingModal.value = false;
  selectedRoomType.value = '';
  // Reset form
  bookingForm.value = {
    name: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    adults: '1',
    children: '0',
    comments: ''
  };
};

// Función para verificar disponibilidad y enviar solicitud
const submitBooking = async () => {
  loading.value = true;
  
  try {
    // 1. Verificar disponibilidad
    const availabilityResponse = await fetch('http://localhost:4000/api/hotel/check-availability', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        roomType: selectedRoomType.value,
        checkIn: bookingForm.value.checkIn,
        checkOut: bookingForm.value.checkOut,
        adults: parseInt(bookingForm.value.adults),
        children: parseInt(bookingForm.value.children)
      }),
    });

    const availabilityData = await availabilityResponse.json();
    
    if (!availabilityData.available) {
      alert('Lo sentimos, no hay habitaciones disponibles para las fechas seleccionadas. Por favor, intente con otras fechas.');
      loading.value = false;
      return;
    }

    // 2. Enviar solicitud de reserva por email
    const bookingResponse = await fetch('http://localhost:4000/api/hotel/booking-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...bookingForm.value,
        roomType: selectedRoomType.value,
        availableRooms: availabilityData.availableRooms
      }),
    });

    const bookingData = await bookingResponse.json();
    
    if (bookingData.success) {
      alert('¡Solicitud de reserva enviada exitosamente! Nos pondremos en contacto contigo pronto para confirmar tu reserva.');
      closeBookingForm();
    } else {
      throw new Error(bookingData.message || 'Error al enviar la solicitud');
    }
    
  } catch (error) {
    console.error('Error:', error);
    alert('Error al procesar la solicitud. Por favor, intente nuevamente o contacte directamente al hotel.');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Animaciones suaves para las cards */
.bg-white {
  transition: all 0.3s ease;
}

.bg-white:hover {
  transform: translateY(-4px);
}

/* Estilos para las imágenes */
img {
  transition: transform 0.4s ease;
}

.bg-white:hover img {
  transform: scale(1.02);
}

/* Efectos de parallax y hover para botones */
button {
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

/* Animación para las etiquetas de categoría */
span[class*="bg-"]:not(button span) {
  transition: transform 0.2s ease;
}

span[class*="bg-"]:hover:not(button span) {
  transform: scale(1.05);
}

/* Mejora del contraste de texto */
h2 {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* Responsive improvements */
@media (max-width: 1024px) {
  .lg\:flex .lg\:w-1\/2:first-child {
    order: 1;
  }
  
  .lg\:flex .lg\:w-1\/2:last-child {
    order: 2;
  }
}

/* Smooth scrolling effect */
.space-y-16 > * {
  scroll-margin-top: 2rem;
}
</style>