<template>
  <div class="min-h-screen">
    <!-- Navigation Header -->
    <header class="bg-white shadow-sm relative z-50">
      <!-- Top Panel -->
      <div class="bg-gray-100 py-2 px-6">
        <div class="container mx-auto flex justify-between items-center">
          <!-- Social Links -->
          <div class="flex items-center space-x-4">
            <span class="text-sm italic text-gray-600">Follow Us:</span>
            <div class="flex space-x-2">
              <a href="#" class="text-gray-600 hover:text-primary-600"><i class="fab fa-instagram"></i></a>
              <a href="https://www.facebook.com/solhotel1/?locale=es_LA" target="_blank" class="text-gray-600 hover:text-primary-600"><i class="fab fa-facebook"></i></a>
            </div>
          </div>
          
          <!-- Logo -->
          <div class="text-center flex items-center justify-center space-x-3">
            <img src="/Fotos/Logo.png" alt="Hotel Sol Logo" class="h-10 w-auto rounded-full" />
            <h1 class="text-2xl font-bold text-gray-800">HOTEL SOL</h1>
          </div>
          
          <!-- Contact Info -->
          <div class="flex items-center space-x-2">
            <i class="fas fa-phone text-primary-600"></i>
            <a href="tel:+573001234567" class="text-gray-600 hover:text-primary-600">+57 317 6388290 - 323 3928158</a>
          </div>
        </div>
      </div>
      
      <!-- Main Navigation -->
      <nav class="py-4 px-6">
        <div class="container mx-auto flex justify-center">
          <ul class="flex space-x-8">
            <li><a href="/" class="text-primary-600 font-semibold border-b-2 border-primary-600 pb-1">Inicio</a></li>
            <li><a href="/about" class="text-gray-700 hover:text-primary-600 transition-colors">Nosotros</a></li>
            <li><a href="/rooms" class="text-gray-700 hover:text-primary-600 transition-colors">Habitaciones</a></li>
            <li><a href="/services" class="text-gray-700 hover:text-primary-600 transition-colors">Servicios</a></li>
            <li><a href="/admin/dashboard" class="text-gray-700 hover:text-primary-600 transition-colors">Panel Admin</a></li>
          </ul>
        </div>
      </nav>
    </header>

    <!-- Hero Section with Slider and Booking Form -->
    <section class="relative">
      <div class="grid lg:grid-cols-3 xl:grid-cols-4 min-h-screen">
        <!-- Slider Section (Left) -->
        <div class="lg:col-span-2 xl:col-span-3 relative bg-gray-500 overflow-hidden">
          <!-- Background Images -->
          <div class="absolute inset-0">
            <img 
              v-for="(image, index) in slideImages"
              :key="index"
              :src="image"
              :alt="`Slide ${index + 1}`"
              :class="[
                'absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out',
                index === currentSlideIndex ? 'opacity-100' : 'opacity-0'
              ]"
            />
            <!-- Overlay oscuro para mejor legibilidad del texto -->
            <div class="absolute inset-0 bg-black/40"></div>
          </div>
          
          <!-- Slide Content -->
          <div class="absolute inset-0 flex items-center justify-center text-white text-center z-10">
            <div class="max-w-4xl px-8">
              <h1 class="text-6xl md:text-8xl font-bold mb-6 animate-fade-in">
                {{ currentSlide.title }}
              </h1>
              <div class="mb-2">
                <div class="w-24 h-0.5 bg-white mx-auto mb-4"></div>
                <h4 class="text-2xl mb-2">{{ currentSlide.subtitle1 }}</h4>
                <h3 class="text-3xl mb-8">{{ currentSlide.subtitle2 }}</h3>
              </div>
              <button 
                @click="navigateToAbout"
                class="border-2 border-white text-white px-8 py-3 text-lg font-medium hover:bg-white hover:text-gray-800 transition-all duration-300">
                conoce más
              </button>
            </div>
          </div>
          
          <!-- Controles del slider -->
          <button
            @click="prevSlide"
            class="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 text-white p-3 rounded-full transition-colors duration-300"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          <button
            @click="nextSlide"
            class="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 text-white p-3 rounded-full transition-colors duration-300"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
          
          <!-- Slide Indicators -->
          <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
            <button 
              v-for="(slide, index) in slides" 
              :key="index"
              @click="currentSlideIndex = index"
              :class="['w-3 h-3 rounded-full transition-colors', 
                      currentSlideIndex === index ? 'bg-white' : 'bg-white/50']"
            ></button>
          </div>
        </div>

        <!-- Booking Form (Right) -->
        <div class="bg-white p-8 flex items-center">
          <div class="w-full">
            <h3 class="text-3xl font-bold text-gray-900 mb-8">Reservar Habitación</h3>
            
            <form @submit.prevent="submitBooking" class="space-y-6">
              <!-- Name Field -->
              <div>
                <p class="text-sm font-semibold text-gray-700 mb-2 uppercase">Su Nombre Completo</p>
                <input 
                  v-model="bookingForm.name"
                  type="text" 
                  placeholder="Ingrese su nombre completo"
                  class="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <!-- Email Field -->
              <div>
                <p class="text-sm font-semibold text-gray-700 mb-2 uppercase">Correo Electrónico</p>
                <input 
                  v-model="bookingForm.email"
                  type="email" 
                  placeholder="su.email@ejemplo.com"
                  class="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <!-- Phone Field -->
              <div>
                <p class="text-sm font-semibold text-gray-700 mb-2 uppercase">Número de Teléfono</p>
                <input 
                  v-model="bookingForm.phone"
                  type="tel" 
                  placeholder="+57 317 6388290 - 323 3928158"
                  class="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <!-- Arrival Date -->
              <div>
                <p class="text-sm font-semibold text-gray-700 mb-2 uppercase">Fecha de Llegada</p>
                <div class="relative">
                  <input 
                    v-model="bookingForm.checkIn"
                    type="date" 
                    class="w-full px-4 py-3 pl-12 border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                  <i class="fas fa-calendar-alt absolute left-4 top-1/2 transform -translate-y-1/2 text-primary-500"></i>
                </div>
              </div>

              <!-- Departure Date -->
              <div>
                <p class="text-sm font-semibold text-gray-700 mb-2 uppercase">Fecha de Salida</p>
                <div class="relative">
                  <input 
                    v-model="bookingForm.checkOut"
                    type="date" 
                    class="w-full px-4 py-3 pl-12 border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                  <i class="fas fa-calendar-alt absolute left-4 top-1/2 transform -translate-y-1/2 text-primary-500"></i>
                </div>
              </div>

              <!-- Adults and Children -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm font-semibold text-gray-700 mb-2 uppercase">Adultos</p>
                  <select 
                    v-model="bookingForm.adults"
                    class="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="1">1 Adulto</option>
                    <option value="2">2 Adultos</option>
                    <option value="3">3 Adultos</option>
                    <option value="4">4 Adultos</option>
                    <option value="5">5 Adultos</option>
                  </select>
                </div>
                
                <div>
                  <p class="text-sm font-semibold text-gray-700 mb-2 uppercase">Niños</p>
                  <select 
                    v-model="bookingForm.children"
                    class="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="0">Sin niños</option>
                    <option value="1">1 Niño</option>
                    <option value="2">2 Niños</option>
                    <option value="3">3 Niños</option>
                    <option value="4">4 Niños</option>
                  </select>
                </div>
              </div>

              <!-- Submit Button -->
              <button 
                type="submit"
                class="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 px-6 transition-colors duration-300 text-lg"
                :disabled="isSubmitting"
              >
                <span v-if="!isSubmitting">Enviar Solicitud de Reserva</span>
                <span v-else>
                  <i class="fas fa-spinner fa-spin mr-2"></i>
                  Enviando...
                </span>
              </button>
            </form>

            <!-- Success/Error Messages -->
            <div v-if="message" class="mt-4 p-3 rounded" :class="messageClass">
              {{ message }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- About Us Section -->
    <section class="py-16 bg-white">
      <div class="container mx-auto px-6">
        <div class="grid lg:grid-cols-2 gap-12 items-center">

          <!-- Video/Image Section -->
          <div class="relative">
      <div class="bg-gray-400 aspect-video rounded-lg overflow-hidden">
    <img
      src="Fotos\FrenteHotel.jpg"
      alt="Video background"
      class="w-full h-96 object-cover"
    >
      </div>
      </div>
          
          <!-- Content Section -->
          <div class="bg-primary-600 text-white p-8 rounded-lg">
            <div class="text-center mb-8">
              <h2 class="text-4xl font-bold mb-4">Sol Hotel</h2>
              <p class="text-2xl font-semibold text-primary-200">Confianza y Calidad</p>
            </div>
            
            <div class="mb-8">
              <p class="text-primary-100 leading-relaxed text-lg mb-6">
                Bienvenidos al Hotel Sol, donde cada estancia se convierte en una experiencia memorable de hospitalidad, confort y excelencia en el servicio.
              </p>
              
              <p class="text-primary-100 leading-relaxed mb-6">
                Con nuestras modernas instalaciones y servicio familiar, nos diferenciamos de la competencia brindando atención personalizada a cada huésped.
              </p>
            </div>

            <!-- Características principales -->
            <div class="grid grid-cols-2 gap-4 mb-8">
              <div class="bg-white/10 p-4 rounded-lg text-center">
                <div class="text-2xl mb-2">🏨</div>
                <p class="font-semibold">20 Habitaciones</p>
              </div>
              <div class="bg-white/10 p-4 rounded-lg text-center">
                <div class="text-2xl mb-2">⭐</div>
                <p class="font-semibold">Servicio Premium</p>
              </div>
              <div class="bg-white/10 p-4 rounded-lg text-center">
                <div class="text-2xl mb-2">☂️</div>
                <p class="font-semibold">Sala Comun</p>
              </div>
              <div class="bg-white/10 p-4 rounded-lg text-center">
                <div class="text-2xl mb-2">🕐</div>
                <p class="font-semibold">24/7 Atención</p>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <a href="/about" class="border-2 border-white text-white px-6 py-3 hover:bg-white hover:text-primary-600 transition-colors font-semibold text-center block">
                📖 Conoce Más Sobre Nosotros
              </a>
              
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Indoor Pool Section -->
    <section class="py-16 bg-gray-100">
      <div class="container mx-auto px-6">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 class="text-4xl font-bold mb-6 text-gray-900">Sala comun Interior del Hotel</h3>
            <p class="text-gray-700 mb-6">
              Este es nuestro rincón común de arte y conversación, donde los colores del mural le ponen onda creativa a cada pausa del día. Aquí puedes sentarte bajo las sombrillas, tomar un café y dejar que las ideas fluyan mientras compartes con otras personas en un ambiente relajado pero con estilo.
            </p>
            <p class="text-gray-700 mb-8">
              Pensado para ejecutivos, emprendedores y equipos, este espacio ofrece mesas cómodas, buena iluminación y un ambiente moderno que invita tanto a reuniones informales como a trabajar con foco. Es el lugar ideal para despejar la mente entre reuniones, cerrar acuerdos con calma o simplemente recargar energía sin salir del entorno profesional.
            </p>
            
          </div>
          
          <div class=" h-[600px] overflow-hidden rounded-xl">
      <img 
    src="Fotos\SalaComun.jpg" 
    alt="Descripcion de la imagen"
    class="w-full h-full object-cover"
          >
      </div>
        </div>
      </div>
    </section>

    <!-- Gallery Section -->
    <section class="py-16 bg-white">
      <div class="container mx-auto px-6">
        <div class="flex justify-between items-center mb-8">
          <h3 class="text-4xl font-bold text-gray-900">Nuestra Galería</h3>
          <a href="#" class="text-primary-600 hover:text-primary-700 font-semibold">Ver Todas las Fotos</a>
        </div>
        
        <hr class="mb-12 border-gray-300">
        
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div 
            v-for="image in displayedImages" 
            :key="image.id" 
            class="relative group cursor-pointer overflow-hidden rounded-lg"
            @click="openImageModal(image)"
          >
            <div class="aspect-[3/2] md:aspect-[4/3] overflow-hidden">
              <img 
                :src="image.src" 
                :alt="image.alt"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
            </div>
            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
              <div class="text-white text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <i class="fas fa-search-plus text-3xl mb-2"></i>
                <p class="text-sm font-medium">{{ image.name }}</p>
              </div>
            </div>
            <!-- Overlay gradient for better text readability -->
            <div class="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </div>
        
        <!-- Show More/Less Button -->
        <div class="text-center mt-8">
          <button 
            @click="toggleShowAllImages"
            class="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300 flex items-center justify-center mx-auto"
          >
            <i :class="showAllImages ? 'fas fa-chevron-up mr-2' : 'fas fa-chevron-down mr-2'"></i>
            {{ showAllImages ? 'Mostrar Menos' : `Ver Más Fotos (${galleryImages.length - initialDisplayCount})` }}
          </button>
        </div>
      </div>
    </section>

    <!-- Image Modal -->
    <div v-if="showImageModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" @click="closeImageModal">
      <div class="relative max-w-4xl max-h-full p-4" @click.stop>
        <!-- Close button -->
        <button 
          @click="closeImageModal"
          class="absolute top-2 right-2 text-white bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full w-10 h-10 flex items-center justify-center z-10"
        >
          <i class="fas fa-times text-xl"></i>
        </button>
        
        <!-- Previous button -->
        <button 
          @click="prevImage"
          class="absolute left-2 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full w-12 h-12 flex items-center justify-center z-10"
        >
          <i class="fas fa-chevron-left text-xl"></i>
        </button>
        
        <!-- Next button -->
        <button 
          @click="nextImage"
          class="absolute right-2 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full w-12 h-12 flex items-center justify-center z-10"
        >
          <i class="fas fa-chevron-right text-xl"></i>
        </button>
        
        <img 
          v-if="selectedImage"
          :src="selectedImage.src" 
          :alt="selectedImage.alt"
          class="max-w-full max-h-full object-contain rounded-lg"
        />
        <div v-if="selectedImage" class="mt-4 text-white text-center">
          <div class="mb-2 text-sm opacity-75">
            {{ galleryImages.findIndex(img => img.id === selectedImage.id) + 1 }} de {{ galleryImages.length }}
          </div>
          <h3 class="text-xl font-semibold mb-2">{{ selectedImage.name }}</h3>
        </div>
      </div>
    </div>

    <!-- Hotel Map Section -->
    <section class="py-16 bg-white">
      <div class="container mx-auto px-6">
        <HotelMap />
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-12">
      <div class="container mx-auto px-6">
        <div class="grid md:grid-cols-3 gap-8">
          <!-- Opening Hours -->
          <div>
            <h4 class="text-xl font-bold mb-6">Horarios de Atención</h4>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span>Entre semana:</span>
                <span class="text-gray-300">8:00–20:00</span>
              </div>
              <div class="flex justify-between">
                <span>Fin de semana:</span>
                <span class="text-gray-300">9:00–18:00</span>
              </div>
            </div>
            <p class="text-gray-400 text-sm mt-6">
              © 2025 Hotel Sol. Todos los derechos reservados.
            </p>
          </div>
          
          <!-- Address -->
          <div>
            <h4 class="text-xl font-bold mb-6">Dirección</h4>
            <div class="space-y-4">
              <div class="flex items-start space-x-3">
                <i class="fas fa-map-marker-alt text-primary-500 mt-1"></i>
                <span class="text-gray-300">Cl. 19 #8-56, San Martín, Cesar</span>
              </div>
              <div class="flex items-center space-x-3">
                <i class="fas fa-phone text-primary-500"></i>
                <a href="tel:+573001234567" class="text-gray-300 hover:text-white">+57 317 6388290 - 323 3928158</a>
              </div>
              <div class="flex items-center space-x-3">
                <i class="fas fa-envelope text-primary-500"></i>
                <a href="mailto:Solhotel.recepcion@gmail.com" class="text-gray-300 hover:text-white">Solhotel.recepcion@gmail.com</a>
              </div>
            </div>
          </div>
          
          <!-- Newsletter -->
          <div>
            <h4 class="text-xl font-bold mb-6">Boletín Informativo</h4>
            <form class="flex">
              <input 
                type="email" 
                placeholder="Ingrese su correo electrónico"
                class="flex-1 px-4 py-2 rounded-l-lg text-gray-900"
              />
              <button class="bg-primary-600 hover:bg-primary-700 px-6 py-2 rounded-r-lg transition-colors">
                Suscribirse
              </button>
            </form>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import HotelMap from './HotelMap.vue';

interface Slide {
  id: number;
  title: string;
  subtitle1: string;
  subtitle2: string;
}

interface BlogPost {
  id: number;
  title: string;
  date: string;
  likes: number;
}

// Form reactive data
const bookingForm = reactive({
  name: '',
  email: '',
  phone: '',
  checkIn: '',
  checkOut: '',
  adults: '1',
  children: '0'
});

// Component state
const isSubmitting = ref(false);
const message = ref('');
const messageType = ref<'success' | 'error'>('success');
const currentSlideIndex = ref(0);

// Imágenes del carrusel
const slideImages = ref([
  '/Fotos/SlidePrincipal/DSC09271.jpg',
  '/Fotos/Gym.jpg',
  '/Fotos/SlidePrincipal/DSC09409.jpg',
  '/Fotos/SlidePrincipal/DSC09254.jpg',
  '/Fotos/SlidePrincipal/DSC09306.jpg',
  '/Fotos/SlidePrincipal/5042186267596098371.jpg',
  '/Fotos/SlidePrincipal/5042186267596098450.jpg'
]);

// Modal state for gallery
const showImageModal = ref(false);
const selectedImage = ref(null);

// Gallery display state
const showAllImages = ref(false);
const initialDisplayCount = 6;

// Slider data
const slides = ref<Slide[]>([
  {
    id: 1,
    title: 'Tu Refugio Ideal',
    subtitle1: 'Disfruta del mundo de la relajación',
    subtitle2: 'y la tranquilidad!'
  },
  {
    id: 2,
    title: 'Relájate y Descansa',
    subtitle1: 'Experimenta el nivel de lujo',
    subtitle2: 'de nuestros tratamientos de spa'
  },
  {
    id: 3,
    title: 'Revitalízate y Relájate',
    subtitle1: 'Déjate llevar por nuestro',
    subtitle2: 'resort spa de primera clase'
  },
  {
    id: 4,
    title: 'Experiencia Única',
    subtitle1: 'Vive momentos inolvidables',
    subtitle2: 'en nuestro hotel'
  },
  {
    id: 5,
    title: 'Comodidad Total',
    subtitle1: 'Diseño moderno y elegante',
    subtitle2: 'para tu descanso perfecto'
  },
  {
    id: 6,
    title: 'Lujo y Confort',
    subtitle1: 'Disfrutá de las mejores amenidades',
    subtitle2: 'del hotel'
  },
  {
    id: 7,
    title: 'Bienvenido al Paraíso',
    subtitle1: 'Donde cada detalle cuenta',
    subtitle2: 'para tu satisfacción'
  }
]);

// Gallery images data
const galleryImages = ref([
  { id: 1, src: '/Fotos/Galeria/DSC09231.jpg', alt: 'Vista del hotel', name: 'Pasillo Principal' },
  { id: 2, src: '/Fotos/Galeria/DSC09236.jpg', alt: 'Habitación premium', name: 'Recepcion' },
  { id: 3, src: '/Fotos/FrenteHotel.jpg', alt: 'Sala de estar', name: 'Entrada Hotel' },
  { id: 4, src: '/Fotos/Galeria/GranArte.jpg', alt: 'Piscina exterior', name: 'Arte La Ultima Cena' },
  { id: 5, src: '/Fotos/Galeria/DSC09257.jpg', alt: 'Restaurante', name: 'Recepcion' },
  { id: 6, src: '/Fotos/Galeria/DSC09289-Mejorado-NR.jpg', alt: 'Gimnasio', name: 'Entrada Habitacion' },
  { id: 7, src: '/Fotos/Galeria/DSC09300.jpg', alt: 'Spa y bienestar', name: 'Arte' },
  { id: 8, src: '/Fotos/Galeria/DSC09316.jpg', alt: 'Terraza panorámica', name: 'Ultima Cena' },
  { id: 9, src: '/Fotos/Galeria/DSC09319.jpg', alt: 'Lobby principal', name: 'Arte de la Sala Comun' },
  
  { id: 11, src: '/Fotos/Galeria/DSC09335.jpg', alt: 'Jardín interior', name: 'Habitacion' },
  { id: 12, src: '/Fotos/Galeria/DSC09338.jpg', alt: 'Bar del hotel', name: ' Habitacion 2' },
  { id: 13, src: '/Fotos/Galeria/DSC09349.jpg', alt: 'Área de juegos', name: 'Pasillo 1' },
  { id: 14, src: '/Fotos/Galeria/DSC09352.jpg', alt: 'Sala de conferencias', name: 'Pasillo 2' },
  { id: 15, src: '/Fotos/Galeria/DSC09366.jpg', alt: 'Vista nocturna', name: 'Arte' },
  { id: 16, src: '/Fotos/Galeria/DSC09372.jpg', alt: 'Desayuno buffet', name: 'Un poco mas de lo que nos caracteriza Arte' }
]);

// Computed property for displayed images
const displayedImages = computed(() => {
  return showAllImages.value ? galleryImages.value : galleryImages.value.slice(0, initialDisplayCount);
});

// Function to toggle show all images
const toggleShowAllImages = () => {
  showAllImages.value = !showAllImages.value;
};

// Navegación
const navigateToAbout = () => {
  window.location.href = '/about';
};

// Computed properties
const messageClass = computed(() => {
  return messageType.value === 'success' 
    ? 'bg-green-100 text-green-800 border border-green-300'
    : 'bg-red-100 text-red-800 border border-red-300';
});

const currentSlide = computed(() => slides.value[currentSlideIndex.value]);

// Auto slide functionality
let slideInterval: number | undefined;

const startSlideshow = () => {
  slideInterval = window.setInterval(() => {
    currentSlideIndex.value = (currentSlideIndex.value + 1) % slides.value.length;
  }, 5500);
};

const stopSlideshow = () => {
  if (slideInterval) {
    clearInterval(slideInterval);
  }
};

// Methods
const submitBooking = async () => {
  isSubmitting.value = true;
  message.value = '';

  try {
    // Validate form data
    if (!bookingForm.name.trim()) {
      throw new Error('Por favor ingrese su nombre completo');
    }
    if (!bookingForm.email.trim()) {
      throw new Error('Por favor ingrese su dirección de correo electrónico');
    }
    if (!bookingForm.phone.trim()) {
      throw new Error('Por favor ingrese su número de teléfono');
    }
    
    // Validate dates
    if (new Date(bookingForm.checkIn) >= new Date(bookingForm.checkOut)) {
      throw new Error('La fecha de salida debe ser posterior a la fecha de entrada');
    }

    // Send booking request email
    const bookingRequestResponse = await fetch('http://localhost:4000/api/hotel/booking-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: bookingForm.name.trim(),
        email: bookingForm.email.trim(),
        phone: bookingForm.phone.trim(),
        checkIn: bookingForm.checkIn,
        checkOut: bookingForm.checkOut,
        adults: parseInt(bookingForm.adults),
        children: parseInt(bookingForm.children),
        roomType: 'Solicitud de reserva',
        comments: `Solicitud de reserva desde el formulario principal del hotel. Huéspedes: ${bookingForm.adults} adultos, ${bookingForm.children} niños.`
      })
    });

    if (bookingRequestResponse.ok) {
      messageType.value = 'success';
      message.value = 'Su solicitud de reserva ha sido enviada exitosamente. Nos pondremos en contacto contigo para finalizar la reserva.';
      
      // Reset form after successful submission
      setTimeout(() => {
        bookingForm.name = '';
        bookingForm.email = '';
        bookingForm.phone = '';
        message.value = '';
      }, 5000);
    } else {
      const errorData = await bookingRequestResponse.json();
      throw new Error(errorData.message || 'Error al enviar la solicitud de reserva');
    }

  } catch (error) {
    messageType.value = 'error';
    message.value = error instanceof Error ? error.message : 'Ocurrió un error. Por favor intente de nuevo.';
  } finally {
    isSubmitting.value = false;
  }
};

// Function to open image modal
const openImageModal = (image) => {
  selectedImage.value = image;
  showImageModal.value = true;
};

// Function to close image modal
const closeImageModal = () => {
  showImageModal.value = false;
  selectedImage.value = null;
};

// Function to navigate to previous image
const prevImage = () => {
  const currentIndex = galleryImages.value.findIndex(img => img.id === selectedImage.value.id);
  const prevIndex = currentIndex > 0 ? currentIndex - 1 : galleryImages.value.length - 1;
  selectedImage.value = galleryImages.value[prevIndex];
};

// Function to navigate to next image
const nextImage = () => {
  const currentIndex = galleryImages.value.findIndex(img => img.id === selectedImage.value.id);
  const nextIndex = currentIndex < galleryImages.value.length - 1 ? currentIndex + 1 : 0;
  selectedImage.value = galleryImages.value[nextIndex];
};

// Function to handle keyboard navigation
const handleKeydown = (event) => {
  if (!showImageModal.value) return;
  
  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault();
      prevImage();
      break;
    case 'ArrowRight':
      event.preventDefault();
      nextImage();
      break;
    case 'Escape':
      event.preventDefault();
      closeImageModal();
      break;
  }
};

// Funciones del carrusel de imágenes
const nextSlide = () => {
  currentSlideIndex.value = (currentSlideIndex.value + 1) % slides.value.length;
  resetAutoplay();
};

const prevSlide = () => {
  currentSlideIndex.value = (currentSlideIndex.value - 1 + slides.value.length) % slides.value.length;
  resetAutoplay();
};

const resetAutoplay = () => {
  stopSlideshow();
  startSlideshow();
};

// Lifecycle hooks
onMounted(() => {
  // Set minimum dates (today)
  const today = new Date().toISOString().split('T')[0];
  if (!bookingForm.checkIn) bookingForm.checkIn = today;
  if (!bookingForm.checkOut) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    bookingForm.checkOut = tomorrow.toISOString().split('T')[0];
  }
  
  // Start slideshow
  startSlideshow();
  
  // Add keyboard event listener
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  stopSlideshow();
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
/* Custom styles for date inputs */
input[type="date"]::-webkit-calendar-picker-indicator {
  opacity: 0;
  position: absolute;
  right: 0;
  top: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

/* Ensure the form fields have consistent styling */
input, select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}

select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}
</style>