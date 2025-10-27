<template>
  <div class="bg-white rounded-xl shadow-sm border">
    <div class="p-6 border-b">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold text-gray-900">
          <i class="fas fa-exchange-alt mr-2 text-blue-600"></i>
          Entrega de Turnos
        </h3>
        <button 
          @click="showNewHandoverModal = true"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <i class="fas fa-plus mr-2"></i>
          Nueva Entrega
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="p-6 text-center">
      <i class="fas fa-spinner fa-spin text-2xl text-blue-600 mb-2"></i>
      <p class="text-gray-600">Cargando entregas de turno...</p>
    </div>

    <!-- Handover List -->
    <div v-else class="p-6">
      <div v-if="handovers.length === 0" class="text-center py-8 text-gray-500">
        <i class="fas fa-clipboard-list text-4xl mb-4"></i>
        <p>No hay entregas de turno registradas hoy</p>
      </div>

      <div v-else class="space-y-4">
        <div 
          v-for="handover in handovers" 
          :key="handover.id"
          class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <!-- Header -->
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center space-x-3">
              <div class="flex items-center">
                <div class="w-3 h-3 rounded-full mr-2" :class="getStatusColor(handover.status)"></div>
                <span class="font-semibold text-gray-800">
                  {{ handover.outgoing_shift }} → {{ handover.incoming_shift }}
                </span>
              </div>
              <span class="text-sm text-gray-600">
                {{ formatTime(handover.handover_time) }}
              </span>
            </div>
            <span 
              class="px-3 py-1 rounded-full text-xs font-medium"
              :class="getStatusBadgeClass(handover.status)"
            >
              {{ getStatusText(handover.status) }}
            </span>
          </div>

          <!-- Employee Info -->
          <div class="grid md:grid-cols-2 gap-4 mb-3">
            <div class="flex items-center">
              <i class="fas fa-arrow-right text-red-500 mr-2"></i>
              <div>
                <p class="font-medium text-gray-800">{{ handover.outgoing_employee_name }}</p>
                <p class="text-sm text-gray-600 capitalize">{{ handover.outgoing_employee_position }}</p>
              </div>
            </div>
            <div class="flex items-center">
              <i class="fas fa-arrow-left text-green-500 mr-2"></i>
              <div>
                <p class="font-medium text-gray-800">{{ handover.incoming_employee_name }}</p>
                <p class="text-sm text-gray-600 capitalize">{{ handover.incoming_employee_position }}</p>
              </div>
            </div>
          </div>

          <!-- Room Statistics -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 p-3 bg-gray-50 rounded-lg">
            <div class="text-center">
              <p class="text-2xl font-bold text-blue-600">{{ handover.rooms_occupied }}</p>
              <p class="text-xs text-gray-600">Ocupadas</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold text-green-600">{{ handover.rooms_available }}</p>
              <p class="text-xs text-gray-600">Disponibles</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold text-orange-600">{{ handover.pending_checkouts }}</p>
              <p class="text-xs text-gray-600">Check-outs</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold text-purple-600">{{ handover.pending_checkins }}</p>
              <p class="text-xs text-gray-600">Check-ins</p>
            </div>
          </div>

          <!-- Notes (Expandable) -->
          <div v-if="hasNotes(handover)" class="mt-3">
            <button 
              @click="toggleNotes(handover.id)"
              class="flex items-center text-sm text-blue-600 hover:text-blue-800 mb-2"
            >
              <i class="fas" :class="expandedNotes.includes(handover.id) ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
              <span class="ml-1">{{ expandedNotes.includes(handover.id) ? 'Ocultar' : 'Ver' }} observaciones</span>
            </button>
            
            <div v-if="expandedNotes.includes(handover.id)" class="space-y-2 pl-4 border-l-2 border-blue-200">
              <div v-if="handover.general_notes">
                <p class="text-sm font-medium text-gray-700">Notas generales:</p>
                <p class="text-sm text-gray-600">{{ handover.general_notes }}</p>
              </div>
              <div v-if="handover.maintenance_issues">
                <p class="text-sm font-medium text-gray-700">Mantenimiento:</p>
                <p class="text-sm text-gray-600">{{ handover.maintenance_issues }}</p>
              </div>
              <div v-if="handover.guest_requests">
                <p class="text-sm font-medium text-gray-700">Solicitudes huéspedes:</p>
                <p class="text-sm text-gray-600">{{ handover.guest_requests }}</p>
              </div>
              <div v-if="handover.inventory_notes">
                <p class="text-sm font-medium text-gray-700">Inventario:</p>
                <p class="text-sm text-gray-600">{{ handover.inventory_notes }}</p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div v-if="handover.status === 'pending'" class="mt-4 pt-3 border-t">
            <button 
              @click="completeHandover(handover)"
              class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <i class="fas fa-check mr-2"></i>
              Completar Entrega
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- New Handover Modal -->
    <div v-if="showNewHandoverModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-screen overflow-y-auto">
        <div class="p-6 border-b">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-gray-900">Nueva Entrega de Turno</h3>
            <button @click="closeModal" class="text-gray-500 hover:text-gray-700">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        <form @submit.prevent="createHandover" class="p-6 space-y-4">
          <!-- Employee Selection -->
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Empleado que entrega (saliente)
              </label>
              <select 
                v-model="newHandover.outgoing_employee_id"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar empleado</option>
                <option v-for="employee in employees" :key="employee.id" :value="employee.id">
                  {{ employee.name }} ({{ employee.position }})
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Empleado que recibe (entrante)
              </label>
              <select 
                v-model="newHandover.incoming_employee_id"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar empleado</option>
                <option v-for="employee in employees" :key="employee.id" :value="employee.id">
                  {{ employee.name }} ({{ employee.position }})
                </option>
              </select>
            </div>
          </div>

          <!-- Shift Information -->
          <div class="grid md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Fecha</label>
              <input 
                v-model="newHandover.shift_date"
                type="date" 
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Turno saliente</label>
              <select 
                v-model="newHandover.outgoing_shift"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar</option>
                <option value="mañana">Mañana</option>
                <option value="tarde">Tarde</option>
                <option value="noche">Noche</option>
                <option value="completo">Completo</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Turno entrante</label>
              <select 
                v-model="newHandover.incoming_shift"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar</option>
                <option value="mañana">Mañana</option>
                <option value="tarde">Tarde</option>
                <option value="noche">Noche</option>
                <option value="completo">Completo</option>
              </select>
            </div>
          </div>

          <!-- Room Statistics -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Hab. Ocupadas</label>
              <input 
                v-model.number="newHandover.rooms_occupied"
                type="number" 
                min="0"
                max="20"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Hab. Disponibles</label>
              <input 
                v-model.number="newHandover.rooms_available"
                type="number" 
                min="0"
                max="20"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Check-outs Pendientes</label>
              <input 
                v-model.number="newHandover.pending_checkouts"
                type="number" 
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Check-ins Pendientes</label>
              <input 
                v-model.number="newHandover.pending_checkins"
                type="number" 
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <!-- Notes -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Notas generales</label>
              <textarea 
                v-model="newHandover.general_notes"
                rows="2"
                placeholder="Información general del turno..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
              ></textarea>
            </div>
            
            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Problemas de mantenimiento</label>
                <textarea 
                  v-model="newHandover.maintenance_issues"
                  rows="2"
                  placeholder="Reportes técnicos, averías..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                ></textarea>
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Solicitudes de huéspedes</label>
                <textarea 
                  v-model="newHandover.guest_requests"
                  rows="2"
                  placeholder="Peticiones especiales, quejas..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                ></textarea>
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Notas de inventario</label>
              <textarea 
                v-model="newHandover.inventory_notes"
                rows="2"
                placeholder="Suministros, reposiciones necesarias..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
              ></textarea>
            </div>
          </div>

          <!-- Submit Buttons -->
          <div class="flex gap-3 pt-4">
            <button 
              type="submit"
              :disabled="isSubmitting"
              class="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              <i class="fas fa-save mr-2"></i>
              {{ isSubmitting ? 'Guardando...' : 'Crear Entrega' }}
            </button>
            <button 
              type="button"
              @click="closeModal"
              class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';

// Component state
const loading = ref(false);
const isSubmitting = ref(false);
const showNewHandoverModal = ref(false);
const expandedNotes = ref<number[]>([]);

// Data
const handovers = ref<any[]>([]);
const employees = ref<any[]>([]);

// New handover form
const newHandover = reactive({
  outgoing_employee_id: '',
  incoming_employee_id: '',
  shift_date: new Date().toISOString().split('T')[0],
  outgoing_shift: '',
  incoming_shift: '',
  rooms_occupied: 0,
  rooms_available: 0,
  pending_checkouts: 0,
  pending_checkins: 0,
  general_notes: '',
  maintenance_issues: '',
  guest_requests: '',
  inventory_notes: ''
});

// Methods
const loadHandovers = async () => {
  try {
    loading.value = true;
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(`http://localhost:4000/api/handovers/date/${today}`);
    
    if (response.ok) {
      const data = await response.json();
      handovers.value = data.handovers || [];
    }
  } catch (error) {
    console.error('Error loading handovers:', error);
  } finally {
    loading.value = false;
  }
};

const loadEmployees = async () => {
  try {
    const response = await fetch('http://localhost:4000/api/employees');
    if (response.ok) {
      const data = await response.json();
      employees.value = data.employees || [];
    }
  } catch (error) {
    console.error('Error loading employees:', error);
  }
};

const createHandover = async () => {
  try {
    isSubmitting.value = true;
    
    const response = await fetch('http://localhost:4000/api/handovers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...newHandover,
        outgoing_signature: `${getEmployeeName(newHandover.outgoing_employee_id)}_${new Date().toISOString().split('T')[0]}`
      })
    });

    if (response.ok) {
      await loadHandovers();
      closeModal();
    } else {
      const error = await response.json();
      alert('Error: ' + error.error);
    }
  } catch (error) {
    console.error('Error creating handover:', error);
    alert('Error al crear la entrega de turno');
  } finally {
    isSubmitting.value = false;
  }
};

const completeHandover = async (handover: any) => {
  const signature = prompt('Confirma tu nombre para completar la entrega:');
  if (!signature) return;

  try {
    const response = await fetch(`http://localhost:4000/api/handovers/${handover.id}/complete`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        incoming_signature: `${signature}_${new Date().toISOString()}`
      })
    });

    if (response.ok) {
      await loadHandovers();
    } else {
      const error = await response.json();
      alert('Error: ' + error.error);
    }
  } catch (error) {
    console.error('Error completing handover:', error);
  }
};

const closeModal = () => {
  showNewHandoverModal.value = false;
  // Reset form
  Object.keys(newHandover).forEach(key => {
    if (key === 'shift_date') {
      newHandover[key] = new Date().toISOString().split('T')[0];
    } else if (typeof newHandover[key] === 'number') {
      newHandover[key] = 0;
    } else {
      newHandover[key] = '';
    }
  });
};

const toggleNotes = (id: number) => {
  const index = expandedNotes.value.indexOf(id);
  if (index > -1) {
    expandedNotes.value.splice(index, 1);
  } else {
    expandedNotes.value.push(id);
  }
};

const hasNotes = (handover: any) => {
  return handover.general_notes || handover.maintenance_issues || 
         handover.guest_requests || handover.inventory_notes;
};

const getEmployeeName = (id: string | number) => {
  const employee = employees.value.find(emp => emp.id == id);
  return employee ? employee.name : 'Desconocido';
};

const formatTime = (datetime: string) => {
  return new Date(datetime).toLocaleString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit'
  });
};

const getStatusColor = (status: string) => {
  const colors = {
    pending: 'bg-yellow-400',
    completed: 'bg-green-400',
    reviewed: 'bg-blue-400'
  };
  return colors[status] || 'bg-gray-400';
};

const getStatusBadgeClass = (status: string) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    reviewed: 'bg-blue-100 text-blue-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const getStatusText = (status: string) => {
  const texts = {
    pending: 'Pendiente',
    completed: 'Completada',
    reviewed: 'Revisada'
  };
  return texts[status] || 'Desconocido';
};

// Initialize
onMounted(() => {
  loadHandovers();
  loadEmployees();
});
</script>

<style scoped>
/* Custom scrollbar for modal */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>