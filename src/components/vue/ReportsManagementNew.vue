<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="container mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-900">Informes y Reportes - Control de Turno</h1>
          <div class="flex items-center space-x-4">
            <button
              @click="showCreateModal = true"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-300"
            >
              <i class="fas fa-plus mr-2"></i>
              Nuevo Reporte
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

    <!-- Reports Table -->
    <div class="container mx-auto px-6 py-8">
      <div class="bg-white rounded-xl shadow-sm border">
        <div class="p-6">
          <h2 class="text-xl font-semibold mb-4">Reportes de Control de Turno</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full table-auto">
              <thead>
                <tr class="bg-gray-50">
                  <th class="px-4 py-2 text-left">Fecha Entrega</th>
                  <th class="px-4 py-2 text-left">Turno</th>
                  <th class="px-4 py-2 text-left">Recibe</th>
                  <th class="px-4 py-2 text-left">Jornada</th>
                  <th class="px-4 py-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="report in reports" :key="report.id" class="border-t">
                  <td class="px-4 py-2">{{ formatDate(report.fecha_entrega) }}</td>
                  <td class="px-4 py-2">{{ report.turno }}</td>
                  <td class="px-4 py-2">{{ report.recibe }}</td>
                  <td class="px-4 py-2">{{ report.jornada }}</td>
                  <td class="px-4 py-2">
                    <button @click="downloadPDF(report.id)" class="text-blue-600 hover:text-blue-800 mr-2">
                      <i class="fas fa-download"></i> PDF
                    </button>
                    <button @click="editReport(report)" class="text-yellow-600 hover:text-yellow-800 mr-2">
                      <i class="fas fa-edit"></i> Editar
                    </button>
                    <button @click="deleteReport(report.id)" class="text-red-600 hover:text-red-800">
                      <i class="fas fa-trash"></i> Eliminar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-semibold mb-4">{{ showEditModal ? 'Editar Reporte' : 'Nuevo Reporte de Control de Turno' }}</h3>
        <form @submit.prevent="saveReport" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Fecha de entrega</label>
              <input v-model="form.fecha_entrega" type="date" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Turno</label>
              <input v-model="form.turno" type="text" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Recibe</label>
              <input v-model="form.recibe" type="text" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Jornada</label>
              <input v-model="form.jornada" type="text" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Habitaciones Ocupadas</label>
            <div class="grid grid-cols-9 gap-2">
              <label v-for="room in allRooms" :key="room" class="flex items-center">
                <input
                  v-model="form.habitaciones_ocupadas"
                  :value="room"
                  type="checkbox"
                  class="mr-2"
                />
                {{ room }}
              </label>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Gaseosas</label>
              <input v-model="form.gaseosas" type="text" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Agua</label>
              <input v-model="form.agua" type="text" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Mecatos</label>
              <input v-model="form.mecatos" type="text" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Elementos de aseo</label>
              <input v-model="form.elementos_aseo" type="text" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Dinero en caja</label>
              <input v-model="form.dinero_caja" type="text" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Mecatos e hidratación</label>
              <input v-model="form.mecatos_hidratacion" type="text" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Compras realizadas en el turno</label>
            <textarea v-model="form.compras_turno" rows="2" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Desayunos</label>
              <input v-model="form.desayunos" type="text" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Almuerzos</label>
              <input v-model="form.almuerzos" type="text" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Cenas</label>
              <input v-model="form.cenas" type="text" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Habitaciones pendientes por aseo</label>
              <input v-model="form.habitaciones_pendientes" type="text" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Compras pendientes</label>
              <input v-model="form.compras_pendientes" type="text" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Pagos pendientes</label>
              <input v-model="form.pagos_pendientes" type="text" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Ingresos</label>
            <textarea v-model="form.ingresos" rows="3" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Egresos</label>
            <textarea v-model="form.egresos" rows="3" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Notas / Observaciones</label>
            <textarea v-model="form.notas" rows="3" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"></textarea>
          </div>

          <div class="flex justify-end space-x-2">
            <button type="button" @click="closeModal" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">
              Cancelar
            </button>
            <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              {{ showEditModal ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReportsManagement',
  data() {
    return {
      reports: [],
      showCreateModal: false,
      showEditModal: false,
      editingId: null,
      allRooms: ['101', '102', '103', '104', '105', '106', '107', '108', '109',
                 '211', '212', '213', '214', '215', '216', '217', '218', '219'],
      form: {
        fecha_entrega: '',
        turno: '',
        recibe: '',
        jornada: '',
        habitaciones_ocupadas: [],
        gaseosas: '',
        agua: '',
        mecatos: '',
        elementos_aseo: '',
        dinero_caja: '',
        mecatos_hidratacion: '',
        compras_turno: '',
        desayunos: '',
        almuerzos: '',
        cenas: '',
        habitaciones_pendientes: '',
        compras_pendientes: '',
        pagos_pendientes: '',
        ingresos: '',
        egresos: '',
        notas: ''
      }
    };
  },
  mounted() {
    this.fetchReports();
  },
  methods: {
    async fetchReports() {
      try {
        const response = await fetch('/api/reports');
        if (response.ok) {
          this.reports = await response.json();
        } else {
          console.error('Error fetching reports');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    },
    async saveReport() {
      try {
        const method = this.showEditModal ? 'PUT' : 'POST';
        const url = this.showEditModal ? `/api/reports/${this.editingId}` : '/api/reports';

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.form)
        });

        if (response.ok) {
          this.closeModal();
          this.fetchReports();
        } else {
          console.error('Error saving report');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    },
    editReport(report) {
      this.form = { ...report, habitaciones_ocupadas: JSON.parse(report.habitaciones_ocupadas || '[]') };
      this.editingId = report.id;
      this.showEditModal = true;
    },
    async deleteReport(id) {
      if (confirm('¿Estás seguro de que quieres eliminar este reporte?')) {
        try {
          const response = await fetch(`/api/reports/${id}`, {
            method: 'DELETE'
          });

          if (response.ok) {
            this.fetchReports();
          } else {
            console.error('Error deleting report');
          }
        } catch (error) {
          console.error('Error:', error);
        }
      }
    },
    async downloadPDF(id) {
      try {
        const response = await fetch(`/api/reports/${id}/pdf`);
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `control-turno-${id}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } else {
          console.error('Error downloading PDF');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    },
    closeModal() {
      this.showCreateModal = false;
      this.showEditModal = false;
      this.editingId = null;
      this.resetForm();
    },
    resetForm() {
      this.form = {
        fecha_entrega: '',
        turno: '',
        recibe: '',
        jornada: '',
        habitaciones_ocupadas: [],
        gaseosas: '',
        agua: '',
        mecatos: '',
        elementos_aseo: '',
        dinero_caja: '',
        mecatos_hidratacion: '',
        compras_turno: '',
        desayunos: '',
        almuerzos: '',
        cenas: '',
        habitaciones_pendientes: '',
        compras_pendientes: '',
        pagos_pendientes: '',
        ingresos: '',
        egresos: '',
        notas: ''
      };
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString();
    },
    goToDashboard() {
      window.location.href = '/admin/dashboard';
    }
  }
};
</script>
