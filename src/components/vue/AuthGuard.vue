<template>
  <template v-if="isAuthenticated">
    <slot></slot>
  </template>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';

export default defineComponent({
  name: 'AuthGuard',
  setup(_, { slots }) {
    const isAuthenticated = ref(false);

    onMounted(() => {
      // Verificar autenticación en el cliente
      const token = localStorage.getItem('hotelToken');
      const user = localStorage.getItem('hotelUser');
      
      if (!token || !user) {
        // Redirigir al login si no está autenticado
        window.location.href = '/login';
        return;
      }

      isAuthenticated.value = true;
      
      // Opcional: Verificar validez del token con el servidor
      fetch('/api/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        if (!response.ok) {
          // Token inválido, limpiar storage y redirigir
          localStorage.removeItem('hotelToken');
          localStorage.removeItem('hotelUser');
          window.location.href = '/login';
        }
      })
      .catch(error => {
        console.error('Error verificando token:', error);
        // En caso de error de red, permitir acceso pero mostrar advertencia
      });
    });

    return { isAuthenticated };
  }
});
</script>
