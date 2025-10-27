import { defineComponent, onMounted } from 'vue';

export default defineComponent({
  name: 'AuthGuard',
  setup(_, { slots }) {
    onMounted(() => {
      // Verificar autenticación en el cliente
      const token = localStorage.getItem('hotelToken');
      const user = localStorage.getItem('hotelUser');
      
      if (!token || !user) {
        // Redirigir al login si no está autenticado
        window.location.href = '/login';
        return;
      }
      
      // Opcional: Verificar validez del token con el servidor
      fetch('http://localhost:4000/api/auth/verify', {
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

    return () => slots.default?.();
  }
});