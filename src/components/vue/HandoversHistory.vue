<template>
  <div>
    <div class="mb-6">
      <a href="/admin/dashboard" class="text-blue-600 hover:text-blue-800 flex items-center gap-2">
        <i class="fas fa-arrow-left"></i>
        Volver al Dashboard
      </a>
    </div>
    
    <h1 class="text-3xl font-bold text-gray-900 mb-6">Historia de Entregas de Turnos</h1>
    
    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <i class="fas fa-spinner fa-spin text-4xl text-blue-600 mb-3"></i>
      <p class="text-gray-600">Cargando entregas...</p>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Filters -->
      <div class="bg-white rounded-lg shadow p-4 mb-6">
        <div class="flex flex-wrap gap-4 items-end">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Filtrar por fecha:</label>
            <input 
              v-model="filterDate" 
              type="date" 
              @change="loadHandovers"
              class="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button 
            @click="filterDate = ''; loadHandovers()"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
          >
            <i class="fas fa-refresh mr-2"></i>Todas las entregas
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="handovers.length === 0" class="text-center py-12 bg-white rounded-lg">
        <i class="fas fa-inbox text-5xl mb-4 opacity-30"></i>
        <p class="text-lg font-semibold text-gray-600">No hay entregas registradas</p>
      </div>

      <!-- Handovers List -->
      <div v-else class="space-y-4">
        <div 
          v-for="handover in handovers" 
          :key="handover.id"
          class="bg-white rounded-lg shadow p-6 border-l-4"
          :class="getStatusBorderClass(handover.status)"
        >
          <!-- Header -->
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-bold text-gray-900">
                {{ handover.outgoing_shift }} → {{ handover.incoming_shift }}
              </h3>
              <p class="text-sm text-gray-600">{{ formatDate(handover.handover_time) }}</p>
            </div>
            <span 
              class="px-3 py-1 rounded-full text-xs font-medium"
              :class="getStatusBadgeClass(handover.status)"
            >
              {{ getStatusText(handover.status) }}
            </span>
          </div>

          <!-- Employees -->
          <div class="grid md:grid-cols-2 gap-4 mb-4">
            <div class="bg-red-50 p-3 rounded-lg">
              <p class="text-xs font-semibold text-red-600 mb-1">Empleado que entrega</p>
              <p class="font-medium text-gray-900">{{ handover.outgoing_employee_name }}</p>
              <p class="text-xs text-gray-600 capitalize">{{ handover.outgoing_employee_position }}</p>
            </div>
            <div class="bg-green-50 p-3 rounded-lg">
              <p class="text-xs font-semibold text-green-600 mb-1">Empleado que recibe</p>
              <p class="font-medium text-gray-900">{{ handover.incoming_employee_name }}</p>
              <p class="text-xs text-gray-600 capitalize">{{ handover.incoming_employee_position }}</p>
            </div>
          </div>

          <!-- Financial Summary -->
          <div class="bg-gray-50 rounded-lg p-4 mb-4">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p class="text-gray-600 text-xs">Caja Recibida</p>
                <p class="font-bold text-green-600">${{ Number(handover.cash_received || 0).toFixed(2) }}</p>
              </div>
              <div>
                <p class="text-gray-600 text-xs">Caja Entregada</p>
                <p class="font-bold text-blue-600">${{ Number(handover.cash_delivered || 0).toFixed(2) }}</p>
              </div>
              <div>
                <p class="text-gray-600 text-xs">Ingresos</p>
                <p class="font-bold text-green-500">+${{ Number(handover.total_income || 0).toFixed(2) }}</p>
              </div>
              <div>
                <p class="text-gray-600 text-xs">Egresos</p>
                <p class="font-bold text-red-500">-${{ Number(handover.total_expenses || 0).toFixed(2) }}</p>
              </div>
            </div>
            <div class="mt-3 pt-3 border-t border-gray-200 flex justify-between">
              <p class="text-sm text-gray-600">Diferencia en Caja:</p>
              <p class="font-bold" :class="handover.cash_difference >= 0 ? 'text-green-600' : 'text-red-600'">
                ${{ Number(handover.cash_difference || 0).toFixed(2) }}
              </p>
            </div>
          </div>

          <!-- Room Status -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
            <div>
              <p class="text-gray-600 text-xs">Ocupadas</p>
              <p class="font-medium">{{ handover.rooms_occupied || 0 }}</p>
            </div>
            <div>
              <p class="text-gray-600 text-xs">Disponibles</p>
              <p class="font-medium">{{ handover.rooms_available || 0 }}</p>
            </div>
            <div>
              <p class="text-gray-600 text-xs">Check-outs</p>
              <p class="font-medium">{{ handover.pending_checkouts || 0 }}</p>
            </div>
            <div>
              <p class="text-gray-600 text-xs">Check-ins</p>
              <p class="font-medium">{{ handover.pending_checkins || 0 }}</p>
            </div>
          </div>

          <!-- Selected Rooms -->
          <div v-if="handover.selected_rooms && getSelectedRoomsList(handover.selected_rooms).length > 0" class="mb-4">
            <p class="text-sm font-semibold text-gray-700 mb-2">Habitaciones Seleccionadas:</p>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="room in getSelectedRoomsList(handover.selected_rooms)" 
                :key="room"
                class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium"
              >
                {{ room }}
              </span>
            </div>
          </div>

          <!-- Notes (Expandable) -->
          <div v-if="handover.general_notes || handover.maintenance_issues || handover.financial_notes" class="border-t pt-4">
            <button 
              @click="toggleNotes(handover.id)"
              class="text-blue-600 text-sm hover:text-blue-800 transition-colors"
            >
              <i class="fas" :class="expandedNotes[handover.id] ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
              {{ expandedNotes[handover.id] ? 'Ocultar' : 'Ver' }} observaciones
            </button>

            <div v-if="expandedNotes[handover.id]" class="mt-3 space-y-2 text-sm">
              <div v-if="handover.general_notes" class="p-3 bg-blue-50 rounded">
                <p class="font-medium text-blue-800">General:</p>
                <p class="text-blue-700">{{ handover.general_notes }}</p>
              </div>
              <div v-if="handover.maintenance_issues" class="p-3 bg-yellow-50 rounded">
                <p class="font-medium text-yellow-800">Mantenimiento:</p>
                <p class="text-yellow-700">{{ handover.maintenance_issues }}</p>
              </div>
              <div v-if="handover.financial_notes" class="p-3 bg-green-50 rounded">
                <p class="font-medium text-green-800">Financiero:</p>
                <p class="text-green-700">{{ handover.financial_notes }}</p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="mt-4 pt-4 border-t flex gap-2">
            <button
              @click="confirmDelete(handover.id)"
              class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
            >
              <i class="fas fa-trash mr-2"></i>
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-sm">
        <div class="p-6">
          <div class="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
            <i class="fas fa-exclamation-triangle text-red-600 text-xl"></i>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 text-center mb-2">¿Eliminar entrega?</h3>
          <p class="text-gray-600 text-center mb-6">
            Esta acción no se puede deshacer. Se eliminará la entrega de turno del registro.
          </p>
          <div class="flex gap-3">
            <button
              @click="showDeleteModal = false"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="deleteHandover(handoverToDelete)"
              class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'HandoversHistory',
  setup() {
    const handovers = ref([]);
    const loading = ref(true);
    const filterDate = ref('');
    const expandedNotes = ref({});
    const showDeleteModal = ref(false);
    const handoverToDelete = ref(null);

    const loadHandovers = async () => {
      try {
        loading.value = true;
        let url = 'http://localhost:4000/api/handovers';
        
        if (filterDate.value) {
          url = `http://localhost:4000/api/handovers/date/${filterDate.value}`;
        }

        const response = await fetch(url);
        const data = await response.json();
        
        if (data.handovers) {
          handovers.value = data.handovers.sort((a, b) => 
            new Date(b.handover_time) - new Date(a.handover_time)
          );
        }
      } catch (error) {
        console.error('Error loading handovers:', error);
        alert('Error al cargar las entregas');
      } finally {
        loading.value = false;
      }
    };

    const formatDate = (dateTime) => {
      if (!dateTime) return 'N/A';
      return new Date(dateTime).toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const getStatusBorderClass = (status) => {
      switch (status) {
        case 'pending': return 'border-yellow-500';
        case 'completed': return 'border-blue-500';
        case 'reviewed': return 'border-green-500';
        default: return 'border-gray-500';
      }
    };

    const getStatusBadgeClass = (status) => {
      switch (status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'completed': return 'bg-blue-100 text-blue-800';
        case 'reviewed': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    const getStatusText = (status) => {
      switch (status) {
        case 'pending': return 'Pendiente';
        case 'completed': return 'Completada';
        case 'reviewed': return 'Revisada';
        default: return 'Desconocido';
      }
    };

    const toggleNotes = (handoverId) => {
      expandedNotes.value[handoverId] = !expandedNotes.value[handoverId];
    };

    const confirmDelete = (handoverId) => {
      handoverToDelete.value = handoverId;
      showDeleteModal.value = true;
    };

    const deleteHandover = async (handoverId) => {
      try {
        const response = await fetch(`http://localhost:4000/api/handovers/${handoverId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          showDeleteModal.value = false;
          handoverToDelete.value = null;
          await loadHandovers();
          alert('Entrega eliminada exitosamente');
        } else {
          const error = await response.json();
          alert(`Error: ${error.error || 'No se pudo eliminar la entrega'}`);
        }
      } catch (error) {
        console.error('Error deleting handover:', error);
        alert('Error al eliminar la entrega');
      }
    };

    const getSelectedRoomsList = (selectedRooms) => {
      if (!selectedRooms) return [];
      
      // Si es una cadena JSON, parsearla
      if (typeof selectedRooms === 'string') {
        try {
          return JSON.parse(selectedRooms);
        } catch (e) {
          return [];
        }
      }
      
      // Si ya es un array, devolverlo
      if (Array.isArray(selectedRooms)) {
        return selectedRooms;
      }
      
      return [];
    };

    onMounted(() => {
      loadHandovers();
    });

    return {
      handovers,
      loading,
      filterDate,
      expandedNotes,
      showDeleteModal,
      handoverToDelete,
      loadHandovers,
      formatDate,
      getStatusBorderClass,
      getStatusBadgeClass,
      getStatusText,
      toggleNotes,
      confirmDelete,
      deleteHandover,
      getSelectedRoomsList
    };
  }
};
</script>

<style scoped>
</style>
