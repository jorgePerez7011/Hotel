<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <a href="/admin/dashboard" class="text-blue-600 hover:text-blue-800 flex items-center gap-2">
        <i class="fas fa-arrow-left"></i>
        Volver al Dashboard
      </a>
    </div>
    
    <h1 class="text-3xl font-bold text-gray-900 mb-6">Ingresos del Mes</h1>
    
    <!-- Filter Section -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Filtrar por:</label>
            <div class="flex gap-2 flex-wrap">
              <button 
                @click="filterType = 'month'"
                :class="filterType === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
                class="px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <i class="fas fa-calendar-alt mr-2"></i>Mes Completo
              </button>
              <button 
                @click="filterType = 'week'"
                :class="filterType === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
                class="px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <i class="fas fa-calendar-week mr-2"></i>Esta Semana
              </button>
              <button 
                @click="filterType = 'day'"
                :class="filterType === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
                class="px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <i class="fas fa-calendar-day mr-2"></i>Día Específico
              </button>
              <button 
                @click="filterType = 'range'"
                :class="filterType === 'range' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
                class="px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <i class="fas fa-calendar-day mr-2"></i>Rango de Fechas
              </button>
            </div>
          </div>
        </div>

        <!-- Date picker for specific day -->
        <div v-if="filterType === 'day'" class="flex gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Seleccionar día:</label>
            <input 
              v-model="selectedDate"
              type="date"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div class="flex items-end">
            <button 
              @click="loadMonthlyIncomeData"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <i class="fas fa-search mr-2"></i>Filtrar
            </button>
          </div>
        </div>

        <!-- Week selector -->
        <div v-if="filterType === 'week'" class="flex gap-4 items-end">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Semana:</label>
            <select 
              v-model="selectedWeek"
              @change="loadMonthlyIncomeData"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar semana...</option>
              <option v-for="(week, index) in weeksOfMonth" :key="index" :value="index">
                {{ week.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- Date range picker -->
        <div v-if="filterType === 'range'" class="flex gap-4 flex-wrap items-end">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Desde:</label>
            <input 
              v-model="dateRangeStart"
              type="date"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Hasta:</label>
            <input 
              v-model="dateRangeEnd"
              type="date"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div class="flex items-end">
            <button 
              @click="applyDateRangeFilter"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <i class="fas fa-search mr-2"></i>Filtrar
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <i class="fas fa-spinner fa-spin text-4xl text-blue-600 mb-3"></i>
      <p class="text-gray-600">Cargando ingresos...</p>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Total Income Card -->
      <div class="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg shadow-lg p-8 mb-6 text-white">
        <p class="text-green-100 text-sm font-medium mb-2">Ingresos Totales del Mes</p>
        <p class="text-5xl font-bold mb-4">
          ${{ new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0 }).format(monthlyIncomeData.total_income || 0) }}
        </p>
        <div class="grid grid-cols-3 gap-4 border-t border-green-400 pt-4">
          <div>
            <p class="text-green-100 text-xs">Entregas</p>
            <p class="text-2xl font-bold">{{ monthlyIncomeData.handover_count || 0 }}</p>
          </div>
          <div>
            <p class="text-green-100 text-xs">Check-outs</p>
            <p class="text-2xl font-bold">{{ monthlyIncomeData.checkout_count || 0 }}</p>
          </div>
          <div>
            <p class="text-green-100 text-xs">Mes</p>
            <p class="text-lg font-bold capitalize">{{ monthlyIncomeData.month }}</p>
          </div>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div class="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <div class="flex items-center justify-between mb-3">
            <span class="text-gray-700 font-semibold">Entregas de Turnos</span>
            <i class="fas fa-exchange-alt text-blue-600 text-2xl"></i>
          </div>
          <p class="text-3xl font-bold text-blue-600">
            ${{ new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0 }).format(monthlyIncomeData.handover_income || 0) }}
          </p>
          <p class="text-sm text-gray-600 mt-2">{{ monthlyIncomeData.handover_count || 0 }} entregas completadas</p>
        </div>

        <div class="bg-purple-50 rounded-lg p-6 border border-purple-200">
          <div class="flex items-center justify-between mb-3">
            <span class="text-gray-700 font-semibold">Check-outs</span>
            <i class="fas fa-door-open text-purple-600 text-2xl"></i>
          </div>
          <p class="text-3xl font-bold text-purple-600">
            ${{ new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0 }).format(monthlyIncomeData.checkout_income || 0) }}
          </p>
          <p class="text-sm text-gray-600 mt-2">{{ monthlyIncomeData.checkout_count || 0 }} check-outs procesados</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="bg-white rounded-lg shadow mb-6">
        <div class="flex gap-0 border-b">
          <button 
            @click="currentTab = 'all'"
            :class="currentTab === 'all' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'"
            class="px-6 py-4 font-medium transition-colors flex-1"
          >
            <i class="fas fa-list mr-2"></i>Todos los Ingresos
          </button>
          <button 
            @click="currentTab = 'handovers'"
            :class="currentTab === 'handovers' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'"
            class="px-6 py-4 font-medium transition-colors flex-1"
          >
            <i class="fas fa-exchange-alt mr-2"></i>Entregas de Turnos
          </button>
          <button 
            @click="currentTab = 'checkouts'"
            :class="currentTab === 'checkouts' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'"
            class="px-6 py-4 font-medium transition-colors flex-1"
          >
            <i class="fas fa-door-open mr-2"></i>Check-outs
          </button>
        </div>

        <!-- Tab Content -->
        <div class="p-6">
          <!-- All Income -->
          <div v-if="currentTab === 'all'">
            <div v-if="allIncomeItems.length === 0" class="text-center py-12 text-gray-500">
              <i class="fas fa-inbox text-5xl mb-3 opacity-30"></i>
              <p class="text-lg">No hay registros de ingresos este mes</p>
            </div>
            <div v-else class="space-y-3">
              <div 
                v-for="item in allIncomeItems"
                :key="item.id"
                class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border-l-4"
                :class="item.type === 'handover' ? 'border-blue-500' : 'border-purple-500'"
              >
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-1">
                    <i :class="item.type === 'handover' ? 'fas fa-exchange-alt text-blue-600' : 'fas fa-door-open text-purple-600'"></i>
                    <p class="font-semibold text-gray-900">{{ item.label }}</p>
                  </div>
                  <p class="text-sm text-gray-600 ml-8">{{ item.date }}</p>
                </div>
                <p class="text-lg font-bold" :class="item.type === 'handover' ? 'text-blue-600' : 'text-purple-600'">
                  ${{ new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0 }).format(item.amount || 0) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Handovers -->
          <div v-if="currentTab === 'handovers'">
            <div v-if="handoverIncomeItems.length === 0" class="text-center py-12 text-gray-500">
              <i class="fas fa-inbox text-5xl mb-3 opacity-30"></i>
              <p class="text-lg">No hay entregas de turnos este mes</p>
            </div>
            <div v-else class="space-y-3">
              <div 
                v-for="item in handoverIncomeItems"
                :key="item.id"
                class="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border-l-4 border-blue-500"
              >
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-1">
                    <i class="fas fa-exchange-alt text-blue-600"></i>
                    <p class="font-semibold text-gray-900">{{ item.label }}</p>
                  </div>
                  <p class="text-sm text-gray-600 ml-8">{{ item.date }} • Turno: {{ item.shift }}</p>
                </div>
                <p class="text-lg font-bold text-blue-600">
                  ${{ new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0 }).format(item.amount || 0) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Checkouts -->
          <div v-if="currentTab === 'checkouts'">
            <div v-if="checkoutIncomeItems.length === 0" class="text-center py-12 text-gray-500">
              <i class="fas fa-inbox text-5xl mb-3 opacity-30"></i>
              <p class="text-lg">No hay check-outs este mes</p>
            </div>
            <div v-else class="space-y-3">
              <div 
                v-for="item in checkoutIncomeItems"
                :key="item.id"
                class="flex items-center justify-between p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors border-l-4 border-purple-500"
              >
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-1">
                    <i class="fas fa-door-open text-purple-600"></i>
                    <p class="font-semibold text-gray-900">{{ item.label }}</p>
                  </div>
                  <p class="text-sm text-gray-600 ml-8">{{ item.date }} • Habitación: {{ item.room }}</p>
                </div>
                <p class="text-lg font-bold text-purple-600">
                  ${{ new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0 }).format(item.amount || 0) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';

const loading = ref(true);
const currentTab = ref('all');
const filterType = ref('month');
const selectedDate = ref('');
const selectedWeek = ref('');
const dateRangeStart = ref('');
const dateRangeEnd = ref('');
const weeksOfMonth = ref([]);

const monthlyIncomeData = ref({
  total_income: 0,
  handover_income: 0,
  checkout_income: 0,
  handover_count: 0,
  checkout_count: 0,
  month: '',
  year: new Date().getFullYear()
});

const allIncomeItems = ref([]);
const handoverIncomeItems = ref([]);
const checkoutIncomeItems = ref([]);

// Datos completos del mes para filtrado
const fullMonthHandoverItems = ref([]);
const fullMonthCheckoutItems = ref([]);

// Función para obtener las semanas del mes actual
const getWeeksOfMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  const weeks = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  let currentDate = new Date(firstDay);
  let weekNumber = 0;
  
  while (currentDate <= lastDay) {
    const weekStart = new Date(currentDate);
    const weekEnd = new Date(currentDate);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    if (weekEnd > lastDay) {
      weekEnd.setDate(lastDay.getDate());
    }
    
    const startStr = weekStart.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
    const endStr = weekEnd.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
    
    weeks.push({
      index: weekNumber,
      label: `Semana ${weekNumber + 1}: ${startStr} - ${endStr}`,
      start: new Date(weekStart),
      end: new Date(weekEnd)
    });
    
    currentDate.setDate(currentDate.getDate() + 7);
    weekNumber++;
  }
  
  return weeks;
};

// Función para filtrar datos según el tipo seleccionado
const getFilteredData = () => {
  let filteredHandovers = [...fullMonthHandoverItems.value];
  let filteredCheckouts = [...fullMonthCheckoutItems.value];
  
  if (filterType.value === 'day' && selectedDate.value) {
    const targetDate = new Date(selectedDate.value);
    const targetDateStr = targetDate.toISOString().split('T')[0];
    
    filteredHandovers = filteredHandovers.filter(h => {
      const hDate = new Date(h.rawDate).toISOString().split('T')[0];
      return hDate === targetDateStr;
    });
    
    filteredCheckouts = filteredCheckouts.filter(c => {
      const cDate = new Date(c.rawDate).toISOString().split('T')[0];
      return cDate === targetDateStr;
    });
  } else if (filterType.value === 'week' && selectedWeek.value !== '') {
    const week = weeksOfMonth.value[parseInt(selectedWeek.value)];
    if (week) {
      filteredHandovers = filteredHandovers.filter(h => {
        const hDate = new Date(h.rawDate);
        return hDate >= week.start && hDate <= week.end;
      });
      
      filteredCheckouts = filteredCheckouts.filter(c => {
        const cDate = new Date(c.rawDate);
        return cDate >= week.start && cDate <= week.end;
      });
    }
  } else if (filterType.value === 'range' && dateRangeStart.value && dateRangeEnd.value) {
    const startDate = new Date(dateRangeStart.value);
    const endDate = new Date(dateRangeEnd.value);
    
    filteredHandovers = filteredHandovers.filter(h => {
      const hDate = new Date(h.rawDate);
      return hDate >= startDate && hDate <= endDate;
    });
    
    filteredCheckouts = filteredCheckouts.filter(c => {
      const cDate = new Date(c.rawDate);
      return cDate >= startDate && cDate <= endDate;
    });
  }
  
  return { filteredHandovers, filteredCheckouts };
};

// Computed property para datos filtrados
const filteredData = computed(() => {
  return getFilteredData();
});

// Actualizar items visibles según el filtro
const getVisibleItems = () => {
  const { filteredHandovers, filteredCheckouts } = filteredData.value;
  
  handoverIncomeItems.value = filteredHandovers;
  checkoutIncomeItems.value = filteredCheckouts;
  
  // Recalcular totales
  const totalHandoverIncome = filteredHandovers.reduce((sum, h) => sum + (h.amount || 0), 0);
  const totalCheckoutIncome = filteredCheckouts.reduce((sum, c) => sum + (c.amount || 0), 0);
  const totalIncome = totalHandoverIncome + totalCheckoutIncome;
  
  monthlyIncomeData.value.total_income = totalIncome;
  monthlyIncomeData.value.handover_income = totalHandoverIncome;
  monthlyIncomeData.value.checkout_income = totalCheckoutIncome;
  monthlyIncomeData.value.handover_count = filteredHandovers.length;
  monthlyIncomeData.value.checkout_count = filteredCheckouts.length;
  
  // Actualizar tabla de todos
  allIncomeItems.value = [
    ...filteredHandovers,
    ...filteredCheckouts
  ].sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime());
};

const loadMonthlyIncomeData = async () => {
  try {
    loading.value = true;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const formattedStart = startOfMonth.toISOString().split('T')[0];
    const formattedEnd = endOfMonth.toISOString().split('T')[0];

    // Obtener datos resumen del mes
    const incomeResponse = await fetch('http://localhost:4000/api/handovers/monthly-income');
    const incomeData = await incomeResponse.json();
    
    if (incomeData.success && incomeData.data) {
      monthlyIncomeData.value.month = incomeData.data.month;
      monthlyIncomeData.value.year = incomeData.data.year;
    }

    // Obtener entregas del mes
    const handoversResponse = await fetch('http://localhost:4000/api/handovers', {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    const handoversData = await handoversResponse.json();
    
    fullMonthHandoverItems.value = (handoversData.handovers || [])
      .filter(h => h.shift_date >= formattedStart && h.shift_date <= formattedEnd && h.status === 'completed')
      .map((h) => ({
        id: `handover-${h.id}`,
        label: `${h.outgoing_shift} → ${h.incoming_shift}`,
        date: new Date(h.shift_date).toLocaleDateString('es-ES'),
        shift: `${h.outgoing_shift}`,
        amount: h.total_income || 0,
        type: 'handover',
        rawDate: h.shift_date
      }));

    // Obtener checkouts del mes
    const checkoutsResponse = await fetch('http://localhost:4000/api/bookings', {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    
    if (checkoutsResponse.ok) {
      const checkoutsData = await checkoutsResponse.json();
      
      fullMonthCheckoutItems.value = (checkoutsData.bookings || [])
        .filter(b => {
          const checkOutDate = new Date(b.check_out_date).toISOString().split('T')[0];
          return checkOutDate >= formattedStart && checkOutDate <= formattedEnd && (b.status === 'checked_out' || b.status === 'checked_in');
        })
        .map((b) => ({
          id: `checkout-${b.id}`,
          label: `Checkout - ${b.guest_name || 'N/A'}`,
          date: new Date(b.check_out_date).toLocaleDateString('es-ES'),
          room: b.room_number || 'N/A',
          amount: b.total_amount || 0,
          type: 'checkout',
          rawDate: b.check_out_date
        }));
    }

    // Inicializar las semanas del mes
    weeksOfMonth.value = getWeeksOfMonth();
    
    // Aplicar filtros y actualizar items visibles
    getVisibleItems();

  } catch (error) {
    console.error('Error loading monthly income:', error);
  } finally {
    loading.value = false;
  }
};

// Función para aplicar filtro de rango de fechas
const applyDateRangeFilter = () => {
  if (dateRangeStart.value && dateRangeEnd.value) {
    const startDate = new Date(dateRangeStart.value);
    const endDate = new Date(dateRangeEnd.value);
    
    if (startDate > endDate) {
      alert('La fecha inicio no puede ser mayor que la fecha fin');
      return;
    }
    
    getVisibleItems();
  } else {
    alert('Por favor selecciona ambas fechas');
  }
};

// Watcher para cambios en selectedDate
watch(() => selectedDate.value, () => {
  if (filterType.value === 'day' && selectedDate.value) {
    getVisibleItems();
  }
});

// Watcher para cambios en selectedWeek
watch(() => selectedWeek.value, () => {
  if (filterType.value === 'week' && selectedWeek.value !== '') {
    getVisibleItems();
  }
});

// Watcher para cambios en filterType
watch(() => filterType.value, () => {
  selectedDate.value = '';
  selectedWeek.value = '';
  dateRangeStart.value = '';
  dateRangeEnd.value = '';
  getVisibleItems();
});

onMounted(() => {
  loadMonthlyIncomeData();
});
</script>
