<template>
  <section class="py-20 bg-gray-100">
    <div class="container mx-auto px-6">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold mb-4 text-gray-900">Contacto</h2>
          <p class="text-xl text-gray-600">
            ¿Tienes preguntas sobre el sistema? Contáctanos
          </p>
        </div>
        
        <div class="grid md:grid-cols-2 gap-12">
          <div>
            <h3 class="text-2xl font-bold mb-6 text-gray-900">Información del Proyecto</h3>
            <div class="space-y-4">
              <div class="flex items-start space-x-3">
                <i class="fas fa-code text-primary-600 text-xl mt-1"></i>
                <div>
                  <h4 class="font-semibold text-gray-900">Stack Tecnológico</h4>
                  <p class="text-gray-600">Vue.js + Astro + Tailwind CSS + Node.js + Express</p>
                </div>
              </div>
              <div class="flex items-start space-x-3">
                <i class="fas fa-database text-primary-600 text-xl mt-1"></i>
                <div>
                  <h4 class="font-semibold text-gray-900">Bases de Datos</h4>
                  <p class="text-gray-600">PostgreSQL y MongoDB disponibles</p>
                </div>
              </div>
              <div class="flex items-start space-x-3">
                <i class="fas fa-rocket text-primary-600 text-xl mt-1"></i>
                <div>
                  <h4 class="font-semibold text-gray-900">Deployment</h4>
                  <p class="text-gray-600">Listo para producción con Docker</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <form @submit.prevent="handleSubmit" class="space-y-6">
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                  Nombre
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  id="name"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  v-model="form.email"
                  type="email"
                  id="email"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label for="message" class="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje
                </label>
                <textarea
                  v-model="form.message"
                  id="message"
                  rows="4"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                class="w-full bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors duration-300 font-semibold"
              >
                Enviar Mensaje
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

const form = reactive({
  name: '',
  email: '',
  message: ''
});

const handleSubmit = async () => {
  try {
    // Aquí se enviaría el formulario al backend
    console.log('Formulario enviado:', form);
    alert('¡Mensaje enviado correctamente!');
    
    // Resetear formulario
    form.name = '';
    form.email = '';
    form.message = '';
  } catch (error) {
    console.error('Error al enviar el formulario:', error);
    alert('Error al enviar el mensaje. Por favor, intenta de nuevo.');
  }
};
</script>