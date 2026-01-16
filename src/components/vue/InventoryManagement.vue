<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="container mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <button 
              @click="goBack"
              class="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Volver"
            >
              <i class="fas fa-arrow-left text-xl text-gray-600"></i>
            </button>
            <div class="bg-orange-600 text-white p-3 rounded-lg mr-4">
              <i class="fas fa-warehouse text-xl"></i>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Almacén & Inventario del Hotel</h1>
              <p class="text-gray-600">Gestión completa de productos, bebidas, alimentos y servicios</p>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="container mx-auto px-6 py-8">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white p-6 rounded-xl shadow-sm border">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Total de Productos</p>
              <p class="text-3xl font-bold text-gray-900 mt-1">{{ inventoryItems.length }}</p>
            </div>
            <div class="bg-blue-100 p-3 rounded-lg">
              <i class="fas fa-box text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Bajo Stock</p>
              <p class="text-3xl font-bold text-orange-600 mt-1">{{ lowStockItems.length }}</p>
            </div>
            <div class="bg-orange-100 p-3 rounded-lg">
              <i class="fas fa-exclamation-triangle text-orange-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Valor Total</p>
              <p class="text-3xl font-bold text-green-600 mt-1">${{ totalValue.toLocaleString('es-CO') }}</p>
            </div>
            <div class="bg-green-100 p-3 rounded-lg">
              <i class="fas fa-dollar-sign text-green-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Categorías</p>
              <p class="text-3xl font-bold text-purple-600 mt-1">{{ uniqueCategories.length }}</p>
            </div>
            <div class="bg-purple-100 p-3 rounded-lg">
              <i class="fas fa-tags text-purple-600 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Controls -->
      <div class="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <div class="flex flex-col md:flex-row items-center gap-4">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por nombre, código o categoría..."
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
          <select
            v-model="filterCategory"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Todas las categorías</option>
            <option v-for="cat in uniqueCategories" :key="cat" :value="cat">
              {{ cat }}
            </option>
          </select>
          <button
            @click="openFormModal(null)"
            class="px-12 py-2 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition-colors flex items-center"
          >
            <i class="fas fa-plus mr-2"></i>
            Agregar Producto
          </button>
        </div>
      </div>

      <!-- Inventory Table -->
      <div class="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-100 border-b">
              <tr>
                <th class="px-6 py-3 text-left text-sm font-bold text-gray-900">Código</th>
                <th class="px-6 py-3 text-left text-sm font-bold text-gray-900">Nombre</th>
                <th class="px-6 py-3 text-left text-sm font-bold text-gray-900">Categoría</th>
                <th class="px-6 py-3 text-left text-sm font-bold text-gray-900">Stock</th>
                <th class="px-6 py-3 text-left text-sm font-bold text-gray-900">Mín. Stock</th>
                <th class="px-6 py-3 text-left text-sm font-bold text-gray-900">Precio Unit.</th>
                <th class="px-6 py-3 text-left text-sm font-bold text-gray-900">Valor Total</th>
                <th class="px-6 py-3 text-left text-sm font-bold text-gray-900">Estado</th>
                <th class="px-6 py-3 text-left text-sm font-bold text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr v-if="filteredItems.length === 0" class="hover:bg-gray-50">
                <td colspan="9" class="px-6 py-8 text-center text-gray-600">
                  No hay productos registrados
                </td>
              </tr>
              <tr v-for="item in filteredItems" :key="item.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 text-sm text-gray-900 font-mono">{{ item.code }}</td>
                <td class="px-6 py-4 text-sm text-gray-900">{{ item.name }}</td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ item.category }}</td>
                <td class="px-6 py-4 text-sm font-bold text-gray-900">{{ item.quantity }}</td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ item.min_stock }}</td>
                <td class="px-6 py-4 text-sm text-gray-900">${{ Number(item.unit_price).toLocaleString('es-CO') }}</td>
                <td class="px-6 py-4 text-sm font-bold text-green-600">
                  ${{ (Number(item.unit_price) * item.quantity).toLocaleString('es-CO') }}
                </td>
                <td class="px-6 py-4 text-sm">
                  <span :class="[
                    'px-3 py-1 rounded-full text-xs font-bold',
                    item.quantity === 0
                      ? 'bg-red-100 text-red-800'
                      : item.quantity <= item.min_stock
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-green-100 text-green-800'
                  ]">
                    {{ item.quantity === 0 ? 'Agotado' : item.quantity <= item.min_stock ? 'Bajo Stock' : 'Disponible' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm space-x-2 flex">
                  <button
                    @click="openFormModal(item)"
                    class="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors font-medium"
                  >
                    <i class="fas fa-edit mr-1"></i>
                    Editar
                  </button>
                  <button
                    @click="deleteItem(item.id)"
                    class="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors font-medium"
                  >
                    <i class="fas fa-trash mr-1"></i>
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Form Modal -->
    <div v-if="showFormModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full mx-4">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-900">
            {{ editingItem ? 'Editar Producto' : 'Nuevo Producto' }}
          </h2>
          <button
            @click="closeFormModal"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <i class="fas fa-times text-xl text-gray-600"></i>
          </button>
        </div>

        <form @submit.prevent="saveItem" class="space-y-4">
          <!-- Row 1: Código y Nombre -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Código del Producto
              </label>
              <input
                v-model="formData.code"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Ej: PROD-001"
                required
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Producto
              </label>
              <input
                v-model="formData.name"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Ej: Jabón Líquido"
                required
              >
            </div>
          </div>

          <!-- Row 2: Categoría, Cantidad y Stock Mínimo -->
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <input
                v-model="formData.category"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Ej: Limpieza"
                required
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Cantidad
              </label>
              <input
                v-model.number="formData.quantity"
                type="number"
                min="0"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="0"
                required
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Stock Mínimo
              </label>
              <input
                v-model.number="formData.min_stock"
                type="number"
                min="0"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="0"
                required
              >
            </div>
          </div>

          <!-- Precio Unitario -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Precio Unitario (COP)
            </label>
            <input
              v-model.number="formData.unit_price"
              type="number"
              min="0"
              step="0.01"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="0.00"
              required
            >
          </div>

          <!-- Descripción -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Descripción (Opcional)
            </label>
            <textarea
              v-model="formData.description"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Detalles adicionales del producto"
            ></textarea>
          </div>

          <!-- Botones -->
          <div class="flex gap-3 mt-6 pt-4 border-t">
            <button
              @click="closeFormModal"
              type="button"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="saveItem"
              class="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              <i class="fas fa-save mr-1"></i>
              {{ editingItem ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4 text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-check text-3xl text-green-600"></i>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">¡Operación Exitosa!</h3>
        <p class="text-gray-600">{{ successMessage }}</p>
        <button
          @click="showSuccessModal = false"
          class="mt-6 w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>

    <!-- Confirm Delete Modal -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-exclamation-triangle text-3xl text-red-600"></i>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2 text-center">Confirmar Eliminación</h3>
        <p class="text-gray-600 text-center mb-6">
          ¿Estás seguro de que deseas eliminar "{{ itemToDelete?.name }}"? Esta acción no se puede deshacer.
        </p>
        <div class="flex gap-3">
          <button
            @click="showDeleteConfirm = false"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="confirmDelete"
            class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const inventoryItems = ref([]);
const searchQuery = ref('');
const filterCategory = ref('');
const showFormModal = ref(false);
const showSuccessModal = ref(false);
const showDeleteConfirm = ref(false);
const editingItem = ref(null);
const itemToDelete = ref(null);
const successMessage = ref('');

const formData = ref({
  code: '',
  name: '',
  category: '',
  quantity: 0,
  min_stock: 0,
  unit_price: 0,
  description: ''
});

const filteredItems = computed(() => {
  return inventoryItems.value.filter(item => {
    const matchesSearch = 
      item.code.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    const matchesCategory = !filterCategory.value || item.category === filterCategory.value;
    
    return matchesSearch && matchesCategory;
  });
});

const lowStockItems = computed(() => {
  return inventoryItems.value.filter(item => item.quantity <= item.min_stock);
});

const uniqueCategories = computed(() => {
  const categories = [...new Set(inventoryItems.value.map(item => item.category))];
  return categories.sort();
});

const totalValue = computed(() => {
  return inventoryItems.value.reduce((total, item) => {
    return total + (Number(item.unit_price) * item.quantity);
  }, 0);
});

const openFormModal = (item) => {
  if (item) {
    editingItem.value = item;
    formData.value = { ...item };
  } else {
    editingItem.value = null;
    formData.value = {
      code: '',
      name: '',
      category: '',
      quantity: 0,
      min_stock: 0,
      unit_price: 0,
      description: ''
    };
  }
  showFormModal.value = true;
};

const closeFormModal = () => {
  showFormModal.value = false;
  editingItem.value = null;
};

const saveItem = () => {
  if (editingItem.value) {
    const index = inventoryItems.value.findIndex(item => item.id === editingItem.value.id);
    if (index !== -1) {
      inventoryItems.value[index] = { ...formData.value };
      successMessage.value = `Producto "${formData.value.name}" actualizado correctamente`;
    }
  } else {
    const newItem = {
      id: Math.max(...inventoryItems.value.map(item => item.id), 0) + 1,
      ...formData.value
    };
    inventoryItems.value.push(newItem);
    successMessage.value = `Producto "${formData.value.name}" creado correctamente`;
  }
  
  closeFormModal();
  showSuccessModal.value = true;
  setTimeout(() => {
    showSuccessModal.value = false;
  }, 3000);
};

const deleteItem = (id) => {
  itemToDelete.value = inventoryItems.value.find(item => item.id === id);
  showDeleteConfirm.value = true;
};

const confirmDelete = () => {
  const index = inventoryItems.value.findIndex(item => item.id === itemToDelete.value.id);
  if (index !== -1) {
    const itemName = inventoryItems.value[index].name;
    inventoryItems.value.splice(index, 1);
    successMessage.value = `Producto "${itemName}" eliminado correctamente`;
    showSuccessModal.value = true;
    setTimeout(() => {
      showSuccessModal.value = false;
    }, 3000);
  }
  showDeleteConfirm.value = false;
};

const goBack = () => {
  window.location.href = '/admin/dashboard';
};
</script>

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type=number] {
  -moz-appearance: textfield;
}
</style>
