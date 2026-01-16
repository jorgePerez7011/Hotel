<template>
  <section id="features" class="py-20 bg-white">
    <div class="container mx-auto px-6">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-bold mb-4 text-gray-900">Características del Sistema</h2>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          Un sistema completo de gestión hotelera con tecnologías modernas
        </p>
      </div>
      
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div 
          v-for="feature in features" 
          :key="feature.id"
          class="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition-shadow duration-300"
        >
          <div class="text-primary-600 mb-4">
            <i :class="feature.icon" class="text-3xl"></i>
          </div>
          <h3 class="text-xl font-bold mb-3 text-gray-900">{{ feature.title }}</h3>
          <p class="text-gray-600 mb-4">{{ feature.description }}</p>
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="tech in feature.technologies" 
              :key="tech"
              class="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium"
            >
              {{ tech }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Feature {
  id: number;
  title: string;
  description: string;
  icon: string;
  technologies: string[];
}

const features = ref<Feature[]>([
  {
    id: 1,
    title: 'Frontend Moderno',
    description: 'Interfaz de usuario reactiva y moderna con Vue.js y Astro, estilizada con Tailwind CSS',
    icon: 'fas fa-desktop',
    technologies: ['Vue.js', 'Astro', 'Tailwind CSS']
  },
  {
    id: 2,
    title: 'Backend Robusto',
    description: 'API REST desarrollada con Node.js y Express, con autenticación JWT y middleware de seguridad',
    icon: 'fas fa-server',
    technologies: ['Node.js', 'Express', 'JWT']
  },
  {
    id: 3,
    title: 'Base de Datos Flexible',
    description: 'Soporte para PostgreSQL y MongoDB, permitiendo elegir la mejor opción para cada caso',
    icon: 'fas fa-database',
    technologies: ['PostgreSQL', 'MongoDB']
  },
  {
    id: 4,
    title: 'Gestión de Reservas',
    description: 'Sistema completo de reservas con calendario interactivo y gestión de disponibilidad',
    icon: 'fas fa-calendar-alt',
    technologies: ['API REST', 'Validaciones']
  },
  {
    id: 5,
    title: 'Panel de Control',
    description: 'Dashboard administrativo para gestionar habitaciones, huéspedes y reportes',
    icon: 'fas fa-chart-bar',
    technologies: ['Vue Components', 'Charts']
  },
  {
    id: 6,
    title: 'Seguridad',
    description: 'Implementación de mejores prácticas de seguridad con CORS, rate limiting y validación',
    icon: 'fas fa-shield-alt',
    technologies: ['Helmet', 'CORS', 'Validation']
  }
]);
</script>
