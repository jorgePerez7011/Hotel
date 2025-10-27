<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="container mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-900">Gestión de Empleados</h1>
          <div class="flex items-center space-x-4">
            <button 
              @click="showAddModal = true"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-300"
            >
              <i class="fas fa-plus mr-2"></i>
              Agregar Empleado
            </button>
            <button 
              @click="goToDashboard"
              class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-300"
            >
              <i class="fas fa-arrow-left mr-2"></i>
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Statistics Cards -->
    <div class="container mx-auto px-6 py-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-xl shadow-sm border">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Total Empleados</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.totalEmployees || 0 }}</p>
            </div>
            <div class="bg-blue-500 p-3 rounded-lg">
              <i class="fas fa-users text-white text-xl"></i>
            </div>
          </div>
        </div>
        
        <div class="bg-white p-6 rounded-xl shadow-sm border">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Recepcionistas</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.recepcionistas || 0 }}</p>
            </div>
            <div class="bg-green-500 p-3 rounded-lg">
              <i class="fas fa-user-tie text-white text-xl"></i>
            </div>
          </div>
        </div>
        
        <div class="bg-white p-6 rounded-xl shadow-sm border">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Aseadoras</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.aseadoras || 0 }}</p>
            </div>
            <div class="bg-purple-500 p-3 rounded-lg">
              <i class="fas fa-broom text-white text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter Section -->
      <div class="bg-white p-6 rounded-xl shadow-sm border mb-6">
        <div class="flex flex-wrap items-center gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Filtrar por Posición</label>
            <select 
              v-model="selectedPosition" 
              @change="filterEmployees"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="recepcionista">Recepcionistas</option>
              <option value="aseadora">Aseadoras</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select 
              v-model="selectedStatus" 
              @change="filterEmployees"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
          
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
            <input 
              v-model="searchTerm"
              @input="filterEmployees"
              type="text" 
              placeholder="Buscar por nombre o email..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <!-- Employees Table -->
      <div class="bg-white rounded-xl shadow-sm border">
        <div class="p-6 border-b">
          <h3 class="text-lg font-semibold text-gray-900">Lista de Empleados</h3>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleado</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posición</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salario</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turno</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="employee in filteredEmployees" :key="employee.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <i class="fas fa-user text-gray-600"></i>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ employee.name }}</div>
                      <div class="text-sm text-gray-500">{{ employee.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" :class="getPositionBadgeClass(employee.position)">
                    <i :class="getPositionIcon(employee.position)" class="mr-1"></i>
                    {{ employee.position }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>{{ employee.phone || 'No disponible' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${{ employee.salary || '0.00' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                  {{ employee.shift || 'mañana' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" :class="employee.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                    {{ employee.is_active ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button 
                    @click="editEmployee(employee)"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button 
                    @click="toggleEmployeeStatus(employee)"
                    :class="employee.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'"
                  >
                    <i :class="employee.is_active ? 'fas fa-user-slash' : 'fas fa-user-check'"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          
          <!-- Empty State -->
          <div v-if="filteredEmployees.length === 0" class="text-center py-12">
            <i class="fas fa-users text-6xl text-gray-300 mb-4"></i>
            <h3 class="text-lg font-semibold text-gray-700 mb-2">No hay empleados</h3>
            <p class="text-gray-500">No se encontraron empleados con los filtros seleccionados.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Employee Modal -->
    <div v-if="showAddModal || editingEmployee" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">
          {{ editingEmployee ? 'Editar Empleado' : 'Agregar Nuevo Empleado' }}
        </h3>
        
        <form @submit.prevent="saveEmployee" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
            <input 
              v-model="employeeForm.name"
              type="text" 
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: María González"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input 
              v-model="employeeForm.email"
              type="email" 
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="empleado@hotelsol.com"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Posición *</label>
            <select 
              v-model="employeeForm.position"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar posición</option>
              <option value="recepcionista">Recepcionista</option>
              <option value="aseadora">Aseadora</option>
            </select>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input 
                v-model="employeeForm.phone"
                type="tel" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+1-555-0123"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Salario</label>
              <input 
                v-model="employeeForm.salary"
                type="number" 
                step="0.01"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1200.00"
              />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Turno</label>
            <select 
              v-model="employeeForm.shift"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="mañana">Mañana</option>
              <option value="tarde">Tarde</option>
              <option value="noche">Noche</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Contacto de Emergencia</label>
            <input 
              v-model="employeeForm.emergency_contact"
              type="text" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nombre y teléfono de contacto"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
            <textarea 
              v-model="employeeForm.address"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Dirección completa"
            ></textarea>
          </div>
          
          <div class="flex justify-end space-x-3 pt-4">
            <button 
              type="button"
              @click="cancelEdit"
              class="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              :disabled="isSubmitting"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md font-medium transition-colors duration-300"
            >
              <span v-if="!isSubmitting">{{ editingEmployee ? 'Actualizar' : 'Agregar' }}</span>
              <span v-else>
                <i class="fas fa-spinner fa-spin mr-2"></i>
                {{ editingEmployee ? 'Actualizando...' : 'Agregando...' }}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';

interface Employee {
  id: number;
  name: string;
  email: string;
  phone?: string;
  position: 'aseadora' | 'recepcionista';
  salary?: number;
  hire_date: string;
  is_active: boolean;
  shift?: string;
  emergency_contact?: string;
  address?: string;
  created_at: string;
}

// Component state
const employees = ref<Employee[]>([]);
const loading = ref(true);
const showAddModal = ref(false);
const editingEmployee = ref<Employee | null>(null);
const isSubmitting = ref(false);

// Filter state
const selectedPosition = ref('');
const selectedStatus = ref('');
const searchTerm = ref('');

// Form state
const employeeForm = reactive({
  name: '',
  email: '',
  phone: '',
  position: '',
  salary: '',
  shift: 'mañana',
  emergency_contact: '',
  address: ''
});

// Computed properties
const stats = computed(() => {
  const activeEmployees = employees.value.filter(emp => emp.is_active);
  return {
    totalEmployees: employees.value.length,
    recepcionistas: activeEmployees.filter(emp => emp.position === 'recepcionista').length,
    aseadoras: activeEmployees.filter(emp => emp.position === 'aseadora').length
  };
});

const filteredEmployees = computed(() => {
  let filtered = employees.value;

  if (selectedPosition.value) {
    filtered = filtered.filter(emp => emp.position === selectedPosition.value);
  }

  if (selectedStatus.value) {
    const isActive = selectedStatus.value === 'active';
    filtered = filtered.filter(emp => emp.is_active === isActive);
  }

  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase();
    filtered = filtered.filter(emp => 
      emp.name.toLowerCase().includes(search) ||
      emp.email.toLowerCase().includes(search)
    );
  }

  return filtered;
});

// Methods
const loadEmployees = async () => {
  try {
    loading.value = true;
    const response = await fetch('http://localhost:4000/api/employees');
    
    if (response.ok) {
      const data = await response.json();
      employees.value = data.employees || [];
    } else {
      console.error('Failed to load employees');
    }
  } catch (error) {
    console.error('Error loading employees:', error);
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  Object.assign(employeeForm, {
    name: '',
    email: '',
    phone: '',
    position: '',
    salary: '',
    shift: 'mañana',
    emergency_contact: '',
    address: ''
  });
};

const editEmployee = (employee: Employee) => {
  editingEmployee.value = employee;
  Object.assign(employeeForm, {
    name: employee.name,
    email: employee.email,
    phone: employee.phone || '',
    position: employee.position,
    salary: employee.salary?.toString() || '',
    shift: employee.shift || 'mañana',
    emergency_contact: employee.emergency_contact || '',
    address: employee.address || ''
  });
};

const cancelEdit = () => {
  showAddModal.value = false;
  editingEmployee.value = null;
  resetForm();
};

const saveEmployee = async () => {
  try {
    isSubmitting.value = true;
    
    const employeeData = {
      ...employeeForm,
      salary: employeeForm.salary ? parseFloat(employeeForm.salary) : null
    };

    let response;
    
    if (editingEmployee.value) {
      // Update existing employee
      response = await fetch(`http://localhost:4000/api/employees/${editingEmployee.value.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData)
      });
    } else {
      // Create new employee
      response = await fetch('http://localhost:4000/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData)
      });
    }

    if (response.ok) {
      const result = await response.json();
      
      if (editingEmployee.value) {
        // Update employee in the list
        const index = employees.value.findIndex(emp => emp.id === editingEmployee.value!.id);
        if (index !== -1) {
          employees.value[index] = result.employee;
        }
        alert('Empleado actualizado exitosamente');
      } else {
        // Add new employee to the list
        employees.value.push(result.employee);
        alert('Empleado agregado exitosamente');
      }
      
      cancelEdit();
    } else {
      const error = await response.json();
      alert(`Error: ${error.message || 'No se pudo guardar el empleado'}`);
    }
    
  } catch (error) {
    console.error('Error saving employee:', error);
    alert('Error de conexión. Por favor, intenta de nuevo.');
  } finally {
    isSubmitting.value = false;
  }
};

const toggleEmployeeStatus = async (employee: Employee) => {
  const action = employee.is_active ? 'desactivar' : 'activar';
  
  if (!confirm(`¿Estás seguro de que quieres ${action} a ${employee.name}?`)) {
    return;
  }

  try {
    const response = await fetch(`http://localhost:4000/api/employees/${employee.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ is_active: !employee.is_active })
    });

    if (response.ok) {
      const result = await response.json();
      
      // Update employee in the list
      const index = employees.value.findIndex(emp => emp.id === employee.id);
      if (index !== -1) {
        employees.value[index] = result.employee;
      }
      
      alert(`Empleado ${action}do exitosamente`);
    } else {
      alert('Error al cambiar el estado del empleado');
    }
  } catch (error) {
    console.error('Error toggling employee status:', error);
    alert('Error de conexión');
  }
};

const filterEmployees = () => {
  // This is automatically handled by the computed property
};

const getPositionBadgeClass = (position: string) => {
  return position === 'recepcionista' 
    ? 'bg-green-100 text-green-800' 
    : 'bg-purple-100 text-purple-800';
};

const getPositionIcon = (position: string) => {
  return position === 'recepcionista' ? 'fas fa-user-tie' : 'fas fa-broom';
};

const goToDashboard = () => {
  window.location.href = '/admin/dashboard';
};

// Lifecycle
onMounted(() => {
  loadEmployees();
});
</script>