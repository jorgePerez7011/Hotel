<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="container mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-900">Informes y Reportes</h1>
          <div class="flex items-center space-x-4">
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

    <!-- Tabs Navigation -->
    <div class="bg-white border-b">
      <div class="container mx-auto px-6">
        <div class="flex gap-8">
          <button
            @click="activeTab = 'checkouts'"
            :class="[
              'py-4 px-2 font-semibold border-b-2 transition-colors',
              activeTab === 'checkouts'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            ]"
          >
            <i class="fas fa-receipt mr-2"></i>
            Checkouts Realizados
          </button>
          <button
            @click="activeTab = 'invoices'"
            :class="[
              'py-4 px-2 font-semibold border-b-2 transition-colors',
              activeTab === 'invoices'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            ]"
          >
            <i class="fas fa-file-invoice-dollar mr-2"></i>
            Facturas/Invoices
          </button>
        </div>
      </div>
    </div>

    <!-- CHECKOUTS TAB -->
    <div v-show="activeTab === 'checkouts'">
      <!-- Filters -->
      <div class="container mx-auto px-6 py-6">
        <div class="bg-white rounded-lg shadow p-4 mb-6">
          <div class="flex flex-wrap gap-4 items-center">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Filtrar por fecha:</label>
              <input 
                v-model="filterDate" 
                type="date" 
                @change="setToday"
                class="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button 
              @click="setToday"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mt-6 font-semibold"
            >
              <i class="fas fa-calendar-today mr-2"></i>Hoy
            </button>
            <button 
              @click="setThisWeek"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mt-6 font-semibold"
            >
              <i class="fas fa-calendar-week mr-2"></i>Esta Semana
            </button>
            <button 
              @click="setThisMonth"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mt-6 font-semibold"
            >
              <i class="fas fa-calendar-alt mr-2"></i>Este Mes
            </button>
          </div>
        </div>
      </div>

      <!-- Checkouts Table -->
      <div class="container mx-auto px-6 py-8">
        <div class="bg-white rounded-xl shadow-sm border">
          <div class="p-6">
            <h2 class="text-xl font-semibold mb-4">
              <i class="fas fa-receipt text-green-600 mr-2"></i>
              Checkouts Realizados - {{ formatDate(filterDate) }}
            </h2>

            <!-- Loading State -->
            <div v-if="loading" class="text-center py-12">
              <i class="fas fa-spinner fa-spin text-4xl text-blue-600 mb-3"></i>
              <p class="text-gray-600">Cargando checkouts...</p>
            </div>

          <!-- Empty State -->
          <div v-else-if="checkoutsList.length === 0" class="text-center py-12 text-gray-500">
            <i class="fas fa-inbox text-5xl mb-4 opacity-30"></i>
            <p class="text-lg font-semibold mb-2">No hay checkouts registrados</p>
            <p class="text-sm">Para la fecha seleccionada no se encontraron checkouts</p>
          </div>

          <!-- Resumen -->
          <div v-else class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <span class="text-gray-600 text-sm block mb-1">Total Checkouts</span>
              <p class="text-3xl font-bold text-blue-600">{{ checkoutsList.length }}</p>
            </div>
            <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <span class="text-gray-600 text-sm block mb-1">Total Ingresos</span>
              <p class="text-3xl font-bold text-green-600">${{ getTotalCheckouts().toFixed(2) }}</p>
            </div>
            <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
              <span class="text-gray-600 text-sm block mb-1">Promedio/Habitación</span>
              <p class="text-3xl font-bold text-orange-600">${{ getAverageCheckout().toFixed(2) }}</p>
            </div>
            <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <span class="text-gray-600 text-sm block mb-1">Noches Totales</span>
              <p class="text-3xl font-bold text-purple-600">{{ getTotalNights() }}</p>
            </div>
          </div>

          <!-- Tabla -->
          <div v-if="checkoutsList.length > 0" class="overflow-x-auto rounded-lg border">
            <table class="w-full">
              <thead>
                <tr class="bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-300">
                  <th class="px-4 py-3 text-left text-sm font-bold text-gray-700">Habitación</th>
                  <th class="px-4 py-3 text-left text-sm font-bold text-gray-700">Huésped</th>
                  <th class="px-4 py-3 text-left text-sm font-bold text-gray-700">Check-in</th>
                  <th class="px-4 py-3 text-left text-sm font-bold text-gray-700">Check-out</th>
                  <th class="px-4 py-3 text-center text-sm font-bold text-gray-700">Noches</th>
                  <th class="px-4 py-3 text-right text-sm font-bold text-gray-700">Precio/Noche</th>
                  <th class="px-4 py-3 text-right text-sm font-bold text-gray-700">Total</th>
                  <th class="px-4 py-3 text-center text-sm font-bold text-gray-700">Teléfono</th>
                  <th class="px-4 py-3 text-center text-sm font-bold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="checkout in checkoutsList" :key="checkout.id" class="border-b hover:bg-blue-50 transition-colors">
                  <td class="px-4 py-3 font-bold text-lg text-blue-600">
                    <i class="fas fa-door-open mr-2"></i>{{ checkout.room_number }}
                  </td>
                  <td class="px-4 py-3 text-gray-900 font-semibold">{{ checkout.guest_name }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ formatDate(checkout.check_in_date) }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ formatDate(checkout.check_out_date) }}</td>
                  <td class="px-4 py-3 text-center font-semibold text-gray-700">{{ checkout.nights_booked }}</td>
                  <td class="px-4 py-3 text-right text-gray-700">${{ parseFloat(checkout.price_per_night).toFixed(2) }}</td>
                  <td class="px-4 py-3 text-right font-bold text-lg text-green-600">${{ parseFloat(checkout.total_amount).toFixed(2) }}</td>
                  <td class="px-4 py-3 text-center text-sm">
                    <span v-if="checkout.guest_phone" class="bg-gray-100 px-2 py-1 rounded">{{ checkout.guest_phone }}</span>
                    <span v-else class="text-gray-400">-</span>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <button 
                      @click="viewDetails(checkout)"
                      class="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded transition"
                      title="Ver detalles"
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                    <button 
                      @click="deleteCheckout(checkout.id)"
                      class="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded transition"
                      title="Eliminar checkout"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="bg-gray-100 border-t-2 border-gray-300 font-bold">
                  <td colspan="5" class="px-4 py-3 text-right">TOTAL:</td>
                  <td></td>
                  <td class="px-4 py-3 text-right text-2xl text-green-600">${{ getTotalCheckouts().toFixed(2) }}</td>
                  <td colspan="2"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Acciones -->
          <div v-if="checkoutsList.length > 0" class="flex gap-2 justify-end pt-4 border-t mt-4">
            <button 
              @click="printCheckouts()"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <i class="fas fa-print"></i>Imprimir
            </button>
            <button 
              @click="downloadCheckoutsCSV()"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <i class="fas fa-file-excel"></i>Descargar (Excel)
            </button>
            <button 
              @click="downloadCheckoutsPDF()"
              class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <i class="fas fa-file-pdf"></i>PDF
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    <div v-if="showDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div class="bg-white p-6 rounded-lg w-full max-w-2xl shadow-2xl my-8">
        <div class="flex justify-between items-center mb-4 border-b pb-4">
          <h3 class="text-2xl font-bold text-gray-900">Detalles del Checkout</h3>
          <button 
            @click="showDetailsModal = false"
            class="text-gray-500 hover:text-gray-700 p-1"
          >
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <div v-if="selectedCheckout" class="space-y-4 max-h-96 overflow-y-auto">
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-gray-50 p-4 rounded-lg">
              <span class="text-sm font-semibold text-gray-600 block mb-1">Habitación</span>
              <p class="text-2xl font-bold text-blue-600">{{ selectedCheckout.room_number }}</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <span class="text-sm font-semibold text-gray-600 block mb-1">Tipo de Habitación</span>
              <p class="text-lg font-semibold text-gray-900">{{ selectedCheckout.room_type || 'Estándar' }}</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <span class="text-sm font-semibold text-gray-600 block mb-1">Huésped</span>
              <p class="text-lg font-semibold text-gray-900">{{ selectedCheckout.guest_name }}</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <span class="text-sm font-semibold text-gray-600 block mb-1">Teléfono</span>
              <p class="text-lg font-semibold text-gray-900">{{ selectedCheckout.guest_phone || '-' }}</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <span class="text-sm font-semibold text-gray-600 block mb-1">Email</span>
              <p class="text-lg font-semibold text-gray-900">{{ selectedCheckout.guest_email || '-' }}</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <span class="text-sm font-semibold text-gray-600 block mb-1">Piso</span>
              <p class="text-lg font-semibold text-gray-900">{{ selectedCheckout.floor }}</p>
            </div>
            <div class="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <span class="text-sm font-semibold text-blue-600 block mb-1">Check-in</span>
              <p class="text-lg font-semibold text-blue-900">{{ formatDate(selectedCheckout.check_in_date) }}</p>
            </div>
            <div class="bg-green-50 border border-green-200 p-4 rounded-lg">
              <span class="text-sm font-semibold text-green-600 block mb-1">Check-out</span>
              <p class="text-lg font-semibold text-green-900">{{ formatDate(selectedCheckout.check_out_date) }}</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <span class="text-sm font-semibold text-gray-600 block mb-1">Noches</span>
              <p class="text-lg font-semibold text-gray-900">{{ selectedCheckout.nights_booked }}</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <span class="text-sm font-semibold text-gray-600 block mb-1">Precio/Noche</span>
              <p class="text-lg font-semibold text-gray-900">${{ parseFloat(selectedCheckout.price_per_night).toFixed(2) }}</p>
            </div>
            <div class="bg-green-50 border border-green-200 p-4 rounded-lg col-span-2">
              <span class="text-sm font-semibold text-green-600 block mb-1">Monto Total</span>
              <p class="text-3xl font-bold text-green-600">${{ parseFloat(selectedCheckout.total_amount).toFixed(2) }}</p>
            </div>
          </div>

          <div v-if="selectedCheckout.notes" class="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <span class="text-sm font-semibold text-yellow-600 block mb-1">Notas</span>
            <p class="text-gray-900">{{ selectedCheckout.notes }}</p>
          </div>
        </div>

        <div class="flex gap-2 justify-end pt-4 border-t mt-4">
            <button 
              @click="printCheckoutDetail(selectedCheckout)"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <i class="fas fa-print"></i>Imprimir
            </button>
            <button 
              @click="downloadCheckoutDetailPDF(selectedCheckout)"
              class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <i class="fas fa-file-pdf"></i>PDF
            </button>
            <button 
              @click="showDetailsModal = false"
              class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Cerrar
            </button>
        </div>
      </div>
    </div>
    </div> <!-- End Checkouts Tab -->

    <!-- INVOICES TAB -->
    <div v-show="activeTab === 'invoices'">
      <!-- Invoices Filters -->
      <div class="container mx-auto px-6 py-6">
        <div class="bg-white rounded-lg shadow p-4 mb-6">
          <div class="flex flex-wrap gap-4 items-center">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Filtro de estado:</label>
              <select 
                v-model="invoiceStatusFilter"
                @change="loadInvoices"
                class="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los estados</option>
                <option value="emitida">Emitida</option>
                <option value="pagada">Pagada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Desde:</label>
              <input 
                v-model="invoiceStartDate" 
                type="date" 
                @change="loadInvoices"
                class="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Hasta:</label>
              <input 
                v-model="invoiceEndDate" 
                type="date" 
                @change="loadInvoices"
                class="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button 
              @click="openCreateInvoiceModal"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg mt-6 font-semibold"
            >
              <i class="fas fa-plus mr-2"></i>Nueva Factura
            </button>
          </div>
        </div>
      </div>

      <!-- Invoices Table -->
      <div class="container mx-auto px-6 py-8">
        <div class="bg-white rounded-xl shadow-sm border">
          <div class="p-6">
            <h2 class="text-xl font-semibold mb-4">
              <i class="fas fa-file-invoice-dollar text-blue-600 mr-2"></i>
              Gestión de Facturas
            </h2>

            <!-- Loading State -->
            <div v-if="loadingInvoices" class="text-center py-12">
              <i class="fas fa-spinner fa-spin text-4xl text-blue-600 mb-3"></i>
              <p class="text-gray-600">Cargando facturas...</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="invoicesList.length === 0" class="text-center py-12 text-gray-500">
              <i class="fas fa-inbox text-5xl mb-4 opacity-30"></i>
              <p class="text-lg font-semibold mb-2">No hay facturas registradas</p>
              <button 
                @click="openCreateInvoiceModal"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold mt-4"
              >
                <i class="fas fa-plus mr-2"></i>Crear primera factura
              </button>
            </div>

            <!-- Invoices Summary -->
            <div v-else class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <span class="text-gray-600 text-sm block mb-1">Total Facturas</span>
                <p class="text-3xl font-bold text-blue-600">{{ invoicesList.length }}</p>
              </div>
              <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <span class="text-gray-600 text-sm block mb-1">Total Ingresos</span>
                <p class="text-3xl font-bold text-green-600">${{ getTotalInvoices().toFixed(2) }}</p>
              </div>
              <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                <span class="text-gray-600 text-sm block mb-1">Pagadas</span>
                <p class="text-3xl font-bold text-yellow-600">{{ getPaidInvoicesCount() }}</p>
              </div>
              <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                <span class="text-gray-600 text-sm block mb-1">Pendientes</span>
                <p class="text-3xl font-bold text-orange-600">{{ getPendingInvoicesCount() }}</p>
              </div>
            </div>

            <!-- Invoices Table -->
            <div v-if="invoicesList.length > 0" class="overflow-x-auto rounded-lg border">
              <table class="w-full">
                <thead>
                  <tr class="bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-300">
                    <th class="px-4 py-3 text-left text-sm font-bold text-gray-700">Nº Factura</th>
                    <th class="px-4 py-3 text-left text-sm font-bold text-gray-700">Huésped</th>
                    <th class="px-4 py-3 text-left text-sm font-bold text-gray-700">Teléfono</th>
                    <th class="px-4 py-3 text-left text-sm font-bold text-gray-700">Empresa</th>
                    <th class="px-4 py-3 text-left text-sm font-bold text-gray-700">Fecha</th>
                    <th class="px-4 py-3 text-center text-sm font-bold text-gray-700">Habitación</th>
                    <th class="px-4 py-3 text-right text-sm font-bold text-gray-700">Total</th>
                    <th class="px-4 py-3 text-center text-sm font-bold text-gray-700">Estado</th>
                    <th class="px-4 py-3 text-center text-sm font-bold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="invoice in invoicesList" :key="invoice.id" class="border-b hover:bg-blue-50 transition-colors">
                    <td class="px-4 py-3 font-bold text-blue-600">{{ invoice.invoice_number }}</td>
                    <td class="px-4 py-3 text-gray-900 font-semibold">{{ invoice.guest_name }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ invoice.guest_phone || '-' }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ invoice.company_id ? 'Empresa' : 'Particular' }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ formatDate(invoice.invoice_date) }}</td>
                    <td class="px-4 py-3 text-center font-semibold text-gray-700">{{ invoice.room_number || '-' }}</td>
                    <td class="px-4 py-3 text-right font-bold text-lg text-green-600">${{ parseFloat(invoice.total).toFixed(2) }}</td>
                    <td class="px-4 py-3 text-center">
                      <span :class="[
                        'px-2 py-1 rounded-full text-xs font-semibold',
                        invoice.status === 'pagada' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'cancelada' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      ]">
                        {{ invoice.status }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-center space-x-2">
                      <button 
                        @click="viewInvoiceDetails(invoice)"
                        class="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded transition"
                        title="Ver detalles"
                      >
                        <i class="fas fa-eye"></i>
                      </button>
                      <button 
                        @click="editInvoice(invoice)"
                        class="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 p-2 rounded transition"
                        title="Editar"
                      >
                        <i class="fas fa-edit"></i>
                      </button>
                      <button 
                        @click="deleteInvoice(invoice.id)"
                        class="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded transition"
                        title="Eliminar"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Acciones para Invoices -->
            <div v-if="invoicesList.length > 0" class="flex gap-2 justify-end pt-4 border-t mt-4">
              <button 
                @click="printInvoices()"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <i class="fas fa-print"></i>Imprimir
              </button>
              <button 
                @click="downloadInvoicesExcel()"
                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <i class="fas fa-file-excel"></i>Descargar (Excel)
              </button>
              <button 
                @click="downloadInvoicesPDF()"
                class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <i class="fas fa-file-pdf"></i>PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div> <!-- End Invoices Tab -->

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white p-6 rounded-lg w-full max-w-md shadow-2xl">
        <div class="flex items-center justify-center mb-4">
          <div class="bg-red-100 p-4 rounded-full">
            <i class="fas fa-exclamation-triangle text-red-600 text-3xl"></i>
          </div>
        </div>
        
        <h3 class="text-2xl font-bold text-gray-900 text-center mb-2">Confirmar Eliminación</h3>
        <p class="text-gray-600 text-center mb-6">
          ¿Estás seguro de que quieres eliminar este checkout? Esta acción no se puede deshacer.
        </p>
        
        <div class="flex gap-3 justify-end">
          <button 
            @click="cancelDelete"
            class="bg-gray-300 hover:bg-gray-400 text-gray-900 px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button 
            @click="confirmDelete"
            class="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <i class="fas fa-trash"></i>
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- Invoice Create/Edit Modal -->
    <div v-if="showInvoiceModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <h3 class="text-2xl font-bold text-gray-900 mb-6">
          <i :class="['fas', editingInvoiceId ? 'fa-edit' : 'fa-plus', 'mr-2']"></i>
          {{ editingInvoiceId ? 'Editar Factura' : 'Nueva Factura' }}
        </h3>

        <form @submit.prevent="saveInvoice" class="space-y-4">
          <!-- Row 1: Invoice Number & Date -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nº Factura *</label>
              <input 
                v-model="invoiceForm.invoice_number" 
                type="text" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="FAC-001"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Fecha de Factura</label>
              <input 
                v-model="invoiceForm.invoice_date" 
                type="date" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <!-- Row 2: Guest Info -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nombre del Huésped *</label>
              <input 
                v-model="invoiceForm.guest_name" 
                type="text" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
              <input 
                v-model="invoiceForm.guest_phone" 
                type="tel" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="+57 300 123 4567"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input 
                v-model="invoiceForm.guest_email" 
                type="email" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <!-- Row 3: Room & Dates -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Habitación</label>
              <input 
                v-model="invoiceForm.room_number" 
                type="text" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="101"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Check-in</label>
              <input 
                v-model="invoiceForm.check_in_date" 
                type="date" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Check-out</label>
              <input 
                v-model="invoiceForm.check_out_date" 
                type="date" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Noches</label>
              <input 
                v-model="invoiceForm.nights" 
                type="number" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
          </div>

          <!-- Row 4: Amounts -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Subtotal</label>
              <input 
                v-model="invoiceForm.subtotal" 
                type="number" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Impuesto/IVA</label>
              <input 
                v-model="invoiceForm.tax" 
                type="number" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Total *</label>
              <input 
                v-model="invoiceForm.total" 
                type="number" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 bg-green-50"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          <!-- Row 5: Payment & Status -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Método de Pago</label>
              <select 
                v-model="invoiceForm.payment_method"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona...</option>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select 
                v-model="invoiceForm.status"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="emitida">Emitida</option>
                <option value="pagada">Pagada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
          </div>

          <!-- Notes -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Notas</label>
            <textarea 
              v-model="invoiceForm.notes" 
              rows="3"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Notas adicionales..."
            ></textarea>
          </div>

          <!-- Buttons -->
          <div class="flex gap-3 justify-end pt-4 border-t">
            <button 
              type="button"
              @click="showInvoiceModal = false"
              class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <i class="fas fa-save"></i>
              {{ editingInvoiceId ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>


<script>
import * as XLSX from 'xlsx';

export default {
  name: 'ReportsManagement',
  data() {
    return {
      activeTab: 'checkouts',
      // Checkouts data
      checkoutsList: [],
      loading: false,
      showDetailsModal: false,
      selectedCheckout: null,
      filterDate: new Date().toISOString().split('T')[0],
      dateRange: 'today', // today, week, month
      startDate: null,
      endDate: null,
      showDeleteModal: false,
      checkoutToDelete: null,
      // Invoices data
      invoicesList: [],
      loadingInvoices: false,
      invoiceStatusFilter: '',
      invoiceStartDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
      invoiceEndDate: new Date().toISOString().split('T')[0],
      showInvoiceModal: false,
      editingInvoiceId: null,
      nextInvoiceNumber: 1,
      invoiceForm: {
        invoice_number: '',
        guest_name: '',
        guest_email: '',
        guest_phone: '',
        guest_identification: '',
        company_id: null,
        invoice_date: new Date().toISOString().split('T')[0],
        check_in_date: '',
        check_out_date: '',
        room_number: '',
        nights: '',
        subtotal: 0,
        tax: 0,
        total: 0,
        payment_method: '',
        status: 'emitida',
        notes: ''
      }
    };
  },
  mounted() {
    this.loadCheckouts();
    this.loadInvoices();
  },
  methods: {
    async loadCheckouts() {
      this.loading = true;
      this.checkoutsList = [];
      try {
        if (this.startDate && this.endDate) {
          // Rango de fechas
          const allCheckouts = [];
          const current = new Date(this.startDate);
          
          while (current <= new Date(this.endDate)) {
            const dateStr = current.toISOString().split('T')[0];
            const response = await fetch(`http://localhost:4000/api/bookings/by-date/${dateStr}`);
            
            if (response.ok) {
              const data = await response.json();
              const checkouts = (data.bookings || []).filter(booking => booking.status === 'checked_out');
              allCheckouts.push(...checkouts);
              console.log(`Found ${checkouts.length} checkouts for ${dateStr}`);
            }
            
            current.setDate(current.getDate() + 1);
          }
          
          this.checkoutsList = allCheckouts;
        } else {
          // Un día específico
          const response = await fetch(`http://localhost:4000/api/bookings/by-date/${this.filterDate}`);
          if (response.ok) {
            const data = await response.json();
            console.log('Checkouts loaded:', data);
            
            // Filtrar solo los que tengan status 'checked_out'
            this.checkoutsList = (data.bookings || []).filter(booking => booking.status === 'checked_out');
            console.log(`Found ${this.checkoutsList.length} checkouts for ${this.filterDate}`);
          } else {
            console.error('Error fetching checkouts:', response.status);
            this.checkoutsList = [];
          }
        }
      } catch (error) {
        console.error('Error:', error);
        this.checkoutsList = [];
      } finally {
        this.loading = false;
      }
    },
    setToday() {
      this.startDate = null;
      this.endDate = null;
      this.filterDate = new Date().toISOString().split('T')[0];
      this.loadCheckouts();
    },
    setThisWeek() {
      const today = new Date();
      const currentDay = today.getDay();
      
      // Calcular inicio de semana (lunes)
      const start = new Date(today);
      start.setDate(today.getDate() - currentDay + (currentDay === 0 ? -6 : 1));
      
      this.startDate = start.toISOString().split('T')[0];
      this.endDate = today.toISOString().split('T')[0];
      this.loadCheckouts();
    },
    setThisMonth() {
      const today = new Date();
      
      // Inicio del mes
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      
      this.startDate = start.toISOString().split('T')[0];
      this.endDate = today.toISOString().split('T')[0];
      this.loadCheckouts();
    },
    setLastDays(days) {
      const today = new Date();
      const start = new Date(today);
      start.setDate(today.getDate() - days);
      
      this.startDate = start.toISOString().split('T')[0];
      this.endDate = today.toISOString().split('T')[0];
      this.loadCheckouts();
    },
    getTotalCheckouts() {
      return this.checkoutsList.reduce((total, checkout) => total + parseFloat(checkout.total_amount || 0), 0);
    },
    getTotalNights() {
      return this.checkoutsList.reduce((total, checkout) => total + (checkout.nights_booked || 0), 0);
    },
    getAverageCheckout() {
      if (this.checkoutsList.length === 0) return 0;
      return this.getTotalCheckouts() / this.checkoutsList.length;
    },
    viewDetails(checkout) {
      this.selectedCheckout = checkout;
      this.showDetailsModal = true;
    },
    printCheckouts() {
      let printContent = `
        <html>
          <head>
            <title>Reporte de Checkouts</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #1a472a; text-align: center; }
              .header-info { margin: 20px 0; border-bottom: 2px solid #1a472a; padding-bottom: 10px; }
              .summary { background-color: #f0f0f0; padding: 15px; margin: 20px 0; border-radius: 5px; }
              .summary-item { display: inline-block; margin: 10px 30px 10px 0; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th { background-color: #2C3E50; color: white; padding: 12px; text-align: left; }
              td { padding: 10px; border-bottom: 1px solid #ddd; }
              tr:hover { background-color: #f9f9f9; }
              .total { font-weight: bold; }
              .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            <h1>HOTEL SOL - REPORTE DE CHECKOUTS</h1>
            <div class="header-info">
              <strong>Fecha:</strong> ${this.formatDate(this.filterDate)}<br>
              <strong>Total Checkouts:</strong> ${this.checkoutsList.length}
            </div>
            
            <div class="summary">
              <div class="summary-item">Total Ingresos: <strong>$${this.getTotalCheckouts().toFixed(2)}</strong></div>
              <div class="summary-item">Promedio: <strong>$${this.getAverageCheckout().toFixed(2)}</strong></div>
              <div class="summary-item">Noches: <strong>${this.getTotalNights()}</strong></div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Habitación</th>
                  <th>Huésped</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Noches</th>
                  <th>Precio/Noche</th>
                  <th>Monto Total</th>
                </tr>
              </thead>
              <tbody>
                ${this.checkoutsList.map(checkout => `
                  <tr>
                    <td><strong>${checkout.room_number}</strong></td>
                    <td>${checkout.guest_name}</td>
                    <td>${this.formatDate(checkout.check_in_date)}</td>
                    <td>${this.formatDate(checkout.check_out_date)}</td>
                    <td>${checkout.nights_booked}</td>
                    <td>$${parseFloat(checkout.price_per_night).toFixed(2)}</td>
                    <td class="total">$${parseFloat(checkout.total_amount).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div style="text-align: right; margin-top: 20px; font-weight: bold; font-size: 16px;">
              TOTAL: $${this.getTotalCheckouts().toFixed(2)}
            </div>
            
            <div class="footer">
              <p>Generado automáticamente por el Sistema de Gestión Hotel Sol</p>
              <p>Fecha: ${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString('es-CO')}</p>
            </div>
          </body>
        </html>
      `;
      
      const newWindow = window.open('', '', 'height=600,width=1000');
      newWindow.document.write(printContent);
      newWindow.document.close();
      newWindow.print();
    },

    // Métodos para Invoices/Facturas
    printInvoices() {
      let printContent = `
        <html>
          <head>
            <title>Reporte de Facturas PDF</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #1a472a; text-align: center; }
              .header-info { margin: 20px 0; border-bottom: 2px solid #1a472a; padding-bottom: 10px; }
              .summary { background-color: #f0f0f0; padding: 15px; margin: 20px 0; border-radius: 5px; }
              .summary-item { display: inline-block; margin: 10px 30px 10px 0; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th { background-color: #2C3E50; color: white; padding: 12px; text-align: left; }
              td { padding: 10px; border-bottom: 1px solid #ddd; }
              tr:hover { background-color: #f9f9f9; }
              .total { font-weight: bold; }
              .status-paid { background-color: #90EE90; }
              .status-pending { background-color: #FFD700; }
              .status-cancelled { background-color: #FFB6C6; }
              .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <h1>HOTEL SOL - REPORTE DE FACTURAS</h1>
            <div class="header-info">
              <strong>Período:</strong> ${this.invoiceStartDate} a ${this.invoiceEndDate}<br>
              <strong>Total Facturas:</strong> ${this.invoicesList.length}
            </div>
            
            <div class="summary">
              <div class="summary-item">Total Ingresos: <strong>$${this.getTotalInvoices().toFixed(2)}</strong></div>
              <div class="summary-item">Facturas Pagadas: <strong>${this.getPaidInvoicesCount()}</strong></div>
              <div class="summary-item">Facturas Pendientes: <strong>${this.getPendingInvoicesCount()}</strong></div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>No. Factura</th>
                  <th>Huésped</th>
                  <th>Fecha</th>
                  <th>Habitación</th>
                  <th>Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                ${this.invoicesList.map(invoice => {
                  let statusClass = '';
                  if(invoice.status === 'pagada') statusClass = 'status-paid';
                  else if(invoice.status === 'emitida') statusClass = 'status-pending';
                  else if(invoice.status === 'cancelada') statusClass = 'status-cancelled';
                  
                  return '<tr><td><strong>' + (invoice.invoice_number || '-') + '</strong></td>' +
                    '<td>' + (invoice.guest_name || '-') + '</td>' +
                    '<td>' + (this.formatDate(invoice.invoice_date) || '-') + '</td>' +
                    '<td>' + (invoice.room_number || '-') + '</td>' +
                    '<td class="total">$' + parseFloat(invoice.total || 0).toFixed(2) + '</td>' +
                    '<td class="' + statusClass + '">' + (invoice.status || '-') + '</td>' +
                    '</tr>';
                }).join('')}
              </tbody>
            </table>
            
            <div style="text-align: right; margin-top: 20px; font-weight: bold; font-size: 16px;">
              TOTAL: $${this.getTotalInvoices().toFixed(2)}
            </div>
            
            <div class="footer">
              <p>Generado automáticamente por el Sistema de Gestión Hotel Sol</p>
              <p>Fecha: ${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString('es-CO')}</p>
            </div>
          </body>
        </html>
      `;
      
      const newWindow = window.open('', '', 'height=600,width=1000');
      newWindow.document.write(printContent);
      newWindow.document.close();
      newWindow.print();
    },

    downloadInvoicesExcel() {
      // Crear workbook de Excel
      const wb = XLSX.utils.book_new();

      // Datos para la hoja
      const sheetData = [];
      
      // Encabezado
      sheetData.push(['HOTEL SOL']);
      sheetData.push(['']);
      sheetData.push(['REPORTE DE FACTURAS (INVOICES)']);
      sheetData.push(['']);
      
      // Información del reporte
      sheetData.push(['Fecha de Reporte:', new Date().toLocaleDateString('es-CO')]);
      sheetData.push(['Período del Reporte:', `${this.invoiceStartDate} a ${this.invoiceEndDate}`]);
      sheetData.push(['Hora de Generación:', new Date().toLocaleTimeString('es-CO')]);
      sheetData.push(['']);
      
      // Encabezados de tabla
      sheetData.push([
        'No. Factura',
        'Huésped',
        'NIT/CC',
        'Teléfono',
        'Email',
        'Fecha Factura',
        'Habitación',
        'Subtotal',
        'IVA (19%)',
        'Total',
        'Estado'
      ]);
      
      // Datos de invoices
      this.invoicesList.forEach(invoice => {
        const subtotal = parseFloat(invoice.total || 0);
        const iva = subtotal * 0.19;
        const total = subtotal + iva;
        
        sheetData.push([
          invoice.invoice_number || '-',
          invoice.guest_name || '-',
          invoice.guest_identification || '-',
          invoice.guest_phone || '-',
          invoice.guest_email || '-',
          this.formatDate(invoice.invoice_date) || '-',
          invoice.room_number || '-',
          `$${subtotal.toFixed(2)}`,
          `$${iva.toFixed(2)}`,
          `$${total.toFixed(2)}`,
          invoice.status || '-'
        ]);
      });
      
      // Resumen
      sheetData.push(['']);
      sheetData.push(['RESUMEN FINANCIERO']);
      sheetData.push(['']);
      sheetData.push(['Total de Facturas:', this.invoicesList.length]);
      sheetData.push(['Facturas Pagadas:', this.getPaidInvoicesCount()]);
      sheetData.push(['Facturas Pendientes:', this.getPendingInvoicesCount()]);
      sheetData.push(['Total Ingresos (sin IVA):', `$${this.getTotalInvoices().toFixed(2)}`]);
      sheetData.push(['Total IVA (19%):', `$${(this.getTotalInvoices() * 0.19).toFixed(2)}`]);
      sheetData.push(['Total con IVA:', `$${(this.getTotalInvoices() * 1.19).toFixed(2)}`]);
      
      // Información del sistema
      sheetData.push(['']);
      sheetData.push(['INFORMACIÓN DEL SISTEMA']);
      sheetData.push(['']);
      sheetData.push(['Software:', 'Sistema de Gestión Hotel Sol']);
      sheetData.push(['Generado:', new Date().toLocaleString('es-CO')]);
      
      // Crear hoja de Excel
      const ws = XLSX.utils.aoa_to_sheet(sheetData);
      
      // Ajustar ancho de columnas
      ws['!cols'] = [
        { wch: 15 },  // No. Factura
        { wch: 20 },  // Huésped
        { wch: 15 },  // NIT/CC
        { wch: 15 },  // Teléfono
        { wch: 20 },  // Email
        { wch: 15 },  // Fecha
        { wch: 12 },  // Habitación
        { wch: 12 },  // Subtotal
        { wch: 12 },  // IVA
        { wch: 12 },  // Total
        { wch: 12 }   // Estado
      ];
      
      // Agregar hoja al workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Facturas');
      
      // Descargar archivo
      const now = new Date();
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      XLSX.writeFile(wb, `invoices_${dateStr}.xlsx`);
    },

    downloadInvoicesPDF() {
      let printContent = `
        <html>
          <head>
            <title>Reporte de Facturas PDF</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #1a472a; text-align: center; }
              .header-info { margin: 20px 0; border-bottom: 2px solid #1a472a; padding-bottom: 10px; }
              .summary { background-color: #f0f0f0; padding: 15px; margin: 20px 0; border-radius: 5px; }
              .summary-item { display: inline-block; margin: 10px 30px 10px 0; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th { background-color: #2C3E50; color: white; padding: 12px; text-align: left; }
              td { padding: 10px; border-bottom: 1px solid #ddd; }
              tr:hover { background-color: #f9f9f9; }
              .total { font-weight: bold; }
              .status-paid { background-color: #90EE90; }
              .status-pending { background-color: #FFD700; }
              .status-cancelled { background-color: #FFB6C6; }
              .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <h1>HOTEL SOL - REPORTE DE FACTURAS</h1>
            <div class="header-info">
              <strong>Período:</strong> ${this.invoiceStartDate} a ${this.invoiceEndDate}<br>
              <strong>Total Facturas:</strong> ${this.invoicesList.length}
            </div>
            
            <div class="summary">
              <div class="summary-item">Total Ingresos: <strong>$${this.getTotalInvoices().toFixed(2)}</strong></div>
              <div class="summary-item">Facturas Pagadas: <strong>${this.getPaidInvoicesCount()}</strong></div>
              <div class="summary-item">Facturas Pendientes: <strong>${this.getPendingInvoicesCount()}</strong></div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>No. Factura</th>
                  <th>Huésped</th>
                  <th>Fecha</th>
                  <th>Habitación</th>
                  <th>Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                ${this.invoicesList.map(invoice => {
                  let statusClass = '';
                  if(invoice.status === 'pagada') statusClass = 'status-paid';
                  else if(invoice.status === 'emitida') statusClass = 'status-pending';
                  else if(invoice.status === 'cancelada') statusClass = 'status-cancelled';
                  
                  return '<tr><td><strong>' + (invoice.invoice_number || '-') + '</strong></td>' +
                    '<td>' + (invoice.guest_name || '-') + '</td>' +
                    '<td>' + (this.formatDate(invoice.invoice_date) || '-') + '</td>' +
                    '<td>' + (invoice.room_number || '-') + '</td>' +
                    '<td class="total">$' + parseFloat(invoice.total || 0).toFixed(2) + '</td>' +
                    '<td class="' + statusClass + '">' + (invoice.status || '-') + '</td>' +
                    '</tr>';
                }).join('')}
              </tbody>
            </table>
            
            <div style="text-align: right; margin-top: 20px; font-weight: bold; font-size: 16px;">
              TOTAL: $${this.getTotalInvoices().toFixed(2)}
            </div>
            
            <div class="footer">
              <p>Generado automáticamente por el Sistema de Gestión Hotel Sol</p>
              <p>Fecha: ${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString('es-CO')}</p>
            </div>
          </body>
        </html>
      `;
      
      const newWindow = window.open('', '', 'height=600,width=1000');
      newWindow.document.write(printContent);
      newWindow.document.close();
      newWindow.print();
    },

    downloadCheckoutsCSV() {
      // Crear workbook de Excel
      const wb = XLSX.utils.book_new();

      // Datos para la hoja
      const sheetData = [];
      
      // Encabezado
      sheetData.push(['HOTEL SOL']);
      sheetData.push(['']);
      sheetData.push(['REPORTE DE CHECKOUTS REALIZADOS']);
      sheetData.push(['']);
      
      // Información del reporte
      sheetData.push(['Fecha de Reporte:', new Date().toLocaleDateString('es-CO')]);
      sheetData.push(['Período del Reporte:', this.formatDate(this.filterDate)]);
      sheetData.push(['Hora de Generación:', new Date().toLocaleTimeString('es-CO')]);
      sheetData.push(['']);
      
      // Encabezados de tabla
      sheetData.push([
        'Habitación',
        'Huésped',
        'Teléfono',
        'Email',
        'Check-in',
        'Check-out',
        'Noches',
        'Precio/Noche',
        'Total'
      ]);
      
      // Datos de checkouts
      this.checkoutsList.forEach(checkout => {
        sheetData.push([
          checkout.room_number || '-',
          checkout.guest_name || '-',
          checkout.guest_phone || '-',
          checkout.guest_email || '-',
          this.formatDate(checkout.check_in_date),
          this.formatDate(checkout.check_out_date),
          checkout.nights_booked || '-',
          `$${parseFloat(checkout.price_per_night).toFixed(2)}`,
          `$${parseFloat(checkout.total_amount).toFixed(2)}`
        ]);
      });
      
      // Resumen
      sheetData.push(['']);
      sheetData.push(['RESUMEN FINANCIERO']);
      sheetData.push(['']);
      sheetData.push(['Total de Checkouts:', this.checkoutsList.length]);
      sheetData.push(['Total de Noches:', this.getTotalNights()]);
      sheetData.push(['Ingresos Totales:', `$${this.getTotalCheckouts().toFixed(2)}`]);
      sheetData.push(['Promedio por Checkout:', `$${this.getAverageCheckout().toFixed(2)}`]);
      
      // Información del sistema
      sheetData.push(['']);
      sheetData.push(['INFORMACIÓN DEL SISTEMA']);
      sheetData.push(['']);
      sheetData.push(['Software:', 'Sistema de Gestión Hotel Sol']);
      sheetData.push(['Generado:', new Date().toLocaleString('es-CO')]);
      
      // Crear hoja de Excel
      const ws = XLSX.utils.aoa_to_sheet(sheetData);
      
      // Ajustar ancho de columnas
      ws['!cols'] = [
        { wch: 15 },  // Habitación
        { wch: 20 },  // Huésped
        { wch: 15 },  // Teléfono
        { wch: 20 },  // Email
        { wch: 20 },  // Check-in
        { wch: 20 },  // Check-out
        { wch: 10 },  // Noches
        { wch: 15 },  // Precio/Noche
        { wch: 15 }   // Total
      ];
      
      // Agregar hoja al workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Checkouts');
      
      // Descargar archivo
      XLSX.writeFile(wb, `checkouts_${this.filterDate}.xlsx`);
    },
    downloadCheckoutsPDF() {
      let printContent = `
        <html>
          <head>
            <title>Reporte de Checkouts PDF</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #1a472a; text-align: center; }
              .header-info { margin: 20px 0; border-bottom: 2px solid #1a472a; padding-bottom: 10px; }
              .summary { background-color: #f0f0f0; padding: 15px; margin: 20px 0; border-radius: 5px; }
              .summary-item { display: inline-block; margin: 10px 30px 10px 0; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th { background-color: #2C3E50; color: white; padding: 12px; text-align: left; }
              td { padding: 10px; border-bottom: 1px solid #ddd; }
              tr:hover { background-color: #f9f9f9; }
              .total { font-weight: bold; }
              .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <h1>HOTEL SOL - REPORTE DE CHECKOUTS</h1>
            <div class="header-info">
              <strong>Fecha:</strong> ${this.formatDate(this.filterDate)}<br>
              <strong>Total Checkouts:</strong> ${this.checkoutsList.length}
            </div>
            
            <div class="summary">
              <div class="summary-item">Total Ingresos: <strong>$${this.getTotalCheckouts().toFixed(2)}</strong></div>
              <div class="summary-item">Promedio: <strong>$${this.getAverageCheckout().toFixed(2)}</strong></div>
              <div class="summary-item">Noches: <strong>${this.getTotalNights()}</strong></div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Habitación</th>
                  <th>Huésped</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Noches</th>
                  <th>Precio/Noche</th>
                  <th>Monto Total</th>
                </tr>
              </thead>
              <tbody>
                ${this.checkoutsList.map(checkout => `
                  <tr>
                    <td><strong>${checkout.room_number}</strong></td>
                    <td>${checkout.guest_name}</td>
                    <td>${this.formatDate(checkout.check_in_date)}</td>
                    <td>${this.formatDate(checkout.check_out_date)}</td>
                    <td>${checkout.nights_booked}</td>
                    <td>$${parseFloat(checkout.price_per_night).toFixed(2)}</td>
                    <td class="total">$${parseFloat(checkout.total_amount).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div style="text-align: right; margin-top: 20px; font-weight: bold; font-size: 16px;">
              TOTAL: $${this.getTotalCheckouts().toFixed(2)}
            </div>
            
            <div class="footer">
              <p>Generado automáticamente por el Sistema de Gestión Hotel Sol</p>
              <p>Fecha: ${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString('es-CO')}</p>
            </div>
          </body>
        </html>
      `;
      
      const newWindow = window.open('', '', 'height=600,width=1000');
      newWindow.document.write(printContent);
      newWindow.document.close();
      newWindow.print();
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    formatDateForInput(dateStr) {
      if (!dateStr) return '';
      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      } catch (error) {
        return '';
      }
    },
    printCheckoutDetail(checkout) {
      let printContent = `
        <html>
          <head>
            <title>Checkout - ${checkout.guest_name}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #1a472a; text-align: center; }
              h2 { color: #2C3E50; margin-top: 20px; }
              .header-info { margin: 20px 0; border-bottom: 2px solid #1a472a; padding-bottom: 10px; }
              .info-section { margin: 20px 0; }
              .info-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 10px 0; }
              .info-item { background-color: #f0f0f0; padding: 10px; border-radius: 5px; }
              .info-label { font-weight: bold; color: #2C3E50; font-size: 12px; }
              .info-value { font-size: 16px; margin-top: 5px; }
              .total-box { background-color: #e8f5e9; border: 2px solid #4CAF50; padding: 15px; border-radius: 5px; margin: 20px 0; }
              .total-amount { font-size: 28px; font-weight: bold; color: #1b5e20; text-align: center; }
              .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 10px; }
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            <h1>HOTEL SOL - COMPROBANTE DE CHECKOUT</h1>
            <div class="header-info">
              <strong>Habitación:</strong> ${checkout.room_number}<br>
              <strong>Huésped:</strong> ${checkout.guest_name}<br>
              <strong>Fecha de Checkout:</strong> ${this.formatDate(checkout.check_out_date)}
            </div>

            <h2>Información del Huésped</h2>
            <div class="info-row">
              <div class="info-item">
                <div class="info-label">Nombre</div>
                <div class="info-value">${checkout.guest_name}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Teléfono</div>
                <div class="info-value">${checkout.guest_phone || '-'}</div>
              </div>
            </div>
            <div class="info-row">
              <div class="info-item">
                <div class="info-label">Email</div>
                <div class="info-value">${checkout.guest_email || '-'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Tipo de Habitación</div>
                <div class="info-value">${checkout.room_type || 'Estándar'}</div>
              </div>
            </div>

            <h2>Detalles de la Estadía</h2>
            <div class="info-row">
              <div class="info-item">
                <div class="info-label">Check-in</div>
                <div class="info-value">${this.formatDate(checkout.check_in_date)}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Check-out</div>
                <div class="info-value">${this.formatDate(checkout.check_out_date)}</div>
              </div>
            </div>
            <div class="info-row">
              <div class="info-item">
                <div class="info-label">Noches</div>
                <div class="info-value">${checkout.nights_booked}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Precio por Noche</div>
                <div class="info-value">$${parseFloat(checkout.price_per_night).toFixed(2)}</div>
              </div>
            </div>

            <div class="total-box">
              <div class="total-amount">$${parseFloat(checkout.total_amount).toFixed(2)}</div>
              <div style="text-align: center; font-size: 14px; color: #1b5e20;">Monto Total a Pagar</div>
            </div>

            <div class="footer">
              <p>Generado automáticamente por el Sistema de Gestión Hotel Sol</p>
              <p>Fecha: ${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString('es-CO')}</p>
            </div>
          </body>
        </html>
      `;
      
      const newWindow = window.open('', '', 'height=600,width=1000');
      newWindow.document.write(printContent);
      newWindow.document.close();
      newWindow.print();
    },
    downloadCheckoutDetailPDF(checkout) {
      let printContent = `
        <html>
          <head>
            <title>Checkout - ${checkout.guest_name}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #1a472a; text-align: center; }
              h2 { color: #2C3E50; margin-top: 20px; }
              .header-info { margin: 20px 0; border-bottom: 2px solid #1a472a; padding-bottom: 10px; }
              .info-section { margin: 20px 0; }
              .info-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 10px 0; }
              .info-item { background-color: #f0f0f0; padding: 10px; border-radius: 5px; }
              .info-label { font-weight: bold; color: #2C3E50; font-size: 12px; }
              .info-value { font-size: 16px; margin-top: 5px; }
              .total-box { background-color: #e8f5e9; border: 2px solid #4CAF50; padding: 15px; border-radius: 5px; margin: 20px 0; }
              .total-amount { font-size: 28px; font-weight: bold; color: #1b5e20; text-align: center; }
              .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 10px; }
            </style>
          </head>
          <body>
            <h1>HOTEL SOL - COMPROBANTE DE CHECKOUT</h1>
            <div class="header-info">
              <strong>Habitación:</strong> ${checkout.room_number}<br>
              <strong>Huésped:</strong> ${checkout.guest_name}<br>
              <strong>Fecha de Checkout:</strong> ${this.formatDate(checkout.check_out_date)}
            </div>

            <h2>Información del Huésped</h2>
            <div class="info-row">
              <div class="info-item">
                <div class="info-label">Nombre</div>
                <div class="info-value">${checkout.guest_name}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Teléfono</div>
                <div class="info-value">${checkout.guest_phone || '-'}</div>
              </div>
            </div>
            <div class="info-row">
              <div class="info-item">
                <div class="info-label">Email</div>
                <div class="info-value">${checkout.guest_email || '-'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Tipo de Habitación</div>
                <div class="info-value">${checkout.room_type || 'Estándar'}</div>
              </div>
            </div>

            <h2>Detalles de la Estadía</h2>
            <div class="info-row">
              <div class="info-item">
                <div class="info-label">Check-in</div>
                <div class="info-value">${this.formatDate(checkout.check_in_date)}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Check-out</div>
                <div class="info-value">${this.formatDate(checkout.check_out_date)}</div>
              </div>
            </div>
            <div class="info-row">
              <div class="info-item">
                <div class="info-label">Noches</div>
                <div class="info-value">${checkout.nights_booked}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Precio por Noche</div>
                <div class="info-value">$${parseFloat(checkout.price_per_night).toFixed(2)}</div>
              </div>
            </div>

            <div class="total-box">
              <div class="total-amount">$${parseFloat(checkout.total_amount).toFixed(2)}</div>
              <div style="text-align: center; font-size: 14px; color: #1b5e20;">Monto Total a Pagar</div>
            </div>

            <div class="footer">
              <p>Generado automáticamente por el Sistema de Gestión Hotel Sol</p>
              <p>Fecha: ${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString('es-CO')}</p>
            </div>
          </body>
        </html>
      `;
      
      const newWindow = window.open('', '', 'height=600,width=1000');
      newWindow.document.write(printContent);
      newWindow.document.close();
      newWindow.print();
    },
    showConfirmDelete(checkoutId) {
      this.checkoutToDelete = checkoutId;
      this.showDeleteModal = true;
    },
    async confirmDelete() {
      if (!this.checkoutToDelete) return;
      
      try {
        const response = await fetch(`http://localhost:4000/api/bookings/${this.checkoutToDelete}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          console.log(`✅ Checkout eliminado exitosamente`);
          this.showDeleteModal = false;
          this.checkoutToDelete = null;
          this.loadCheckouts();
        } else {
          const error = await response.json();
          alert(`Error: ${error.message || 'No se pudo eliminar el checkout'}`);
        }
      } catch (error) {
        console.error('Error al eliminar:', error);
        alert('Error al eliminar el checkout');
      }
    },
    cancelDelete() {
      this.showDeleteModal = false;
      this.checkoutToDelete = null;
    },
    async deleteCheckout(checkoutId) {
      this.showConfirmDelete(checkoutId);
    },
    goToDashboard() {
      window.location.href = '/admin/dashboard';
    },
    // Invoices methods
    async loadInvoices() {
      this.loadingInvoices = true;
      try {
        const params = new URLSearchParams();
        if (this.invoiceStatusFilter) params.append('status', this.invoiceStatusFilter);
        if (this.invoiceStartDate) params.append('start_date', this.invoiceStartDate);
        if (this.invoiceEndDate) params.append('end_date', this.invoiceEndDate);

        const response = await fetch(`http://localhost:4000/api/invoices?${params}`, {
          method: 'GET'
        });

        if (response.ok) {
          this.invoicesList = await response.json();
          console.log(`✅ ${this.invoicesList.length} facturas cargadas`);
        } else {
          console.error('Error loading invoices');
        }
      } catch (error) {
        console.error('Error al cargar facturas:', error);
      } finally {
        this.loadingInvoices = false;
      }
    },
    openCreateInvoiceModal() {
      this.editingInvoiceId = null;
      this.resetInvoiceForm();
      this.showInvoiceModal = true;
    },
    editInvoice(invoice) {
      this.editingInvoiceId = invoice.id;
      this.invoiceForm = {
        ...invoice,
        check_in_date: this.formatDateForInput(invoice.check_in_date),
        check_out_date: this.formatDateForInput(invoice.check_out_date),
        invoice_date: this.formatDateForInput(invoice.invoice_date)
      };
      this.showInvoiceModal = true;
    },
    resetInvoiceForm() {
      // Generar número de factura secuencial
      const autoNumber = String(this.nextInvoiceNumber).padStart(3, '0');
      
      this.invoiceForm = {
        invoice_number: autoNumber,
        guest_name: '',
        guest_email: '',
        guest_phone: '',
        guest_identification: '',
        company_id: null,
        invoice_date: new Date().toISOString().split('T')[0],
        check_in_date: '',
        check_out_date: '',
        room_number: '',
        nights: '',
        subtotal: 0,
        tax: 0,
        total: 0,
        payment_method: '',
        status: 'emitida',
        notes: ''
      };
    },
    async saveInvoice() {
      try {
        if (!this.invoiceForm.invoice_number || !this.invoiceForm.guest_name || !this.invoiceForm.total) {
          alert('Por favor completa los campos requeridos: Nº Factura, Huésped y Total');
          return;
        }

        const method = this.editingInvoiceId ? 'PUT' : 'POST';
        const url = this.editingInvoiceId 
          ? `http://localhost:4000/api/invoices/${this.editingInvoiceId}`
          : 'http://localhost:4000/api/invoices';

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.invoiceForm)
        });

        if (response.ok) {
          console.log(`✅ Factura ${this.editingInvoiceId ? 'actualizada' : 'creada'} exitosamente`);
          // Incrementar el contador si es una nueva factura
          if (!this.editingInvoiceId) {
            this.nextInvoiceNumber++;
          }
          this.showInvoiceModal = false;
          this.loadInvoices();
        } else {
          const error = await response.json();
          alert(`Error: ${error.message}`);
        }
      } catch (error) {
        console.error('Error al guardar factura:', error);
        alert('Error al guardar la factura');
      }
    },
    async deleteInvoice(invoiceId) {
      if (!confirm('¿Estás seguro de que quieres eliminar esta factura?')) return;

      try {
        const response = await fetch(`http://localhost:4000/api/invoices/${invoiceId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          console.log(`✅ Factura eliminada exitosamente`);
          this.loadInvoices();
        } else {
          const error = await response.json();
          alert(`Error: ${error.message}`);
        }
      } catch (error) {
        console.error('Error al eliminar factura:', error);
        alert('Error al eliminar la factura');
      }
    },
    viewInvoiceDetails(invoice) {
      alert(`Factura Nº: ${invoice.invoice_number}\nHuésped: ${invoice.guest_name}\nTotal: $${parseFloat(invoice.total).toFixed(2)}\nEstado: ${invoice.status}`);
    },
    getTotalInvoices() {
      return this.invoicesList.reduce((total, invoice) => total + parseFloat(invoice.total || 0), 0);
    },
    getPaidInvoicesCount() {
      return this.invoicesList.filter(invoice => invoice.status === 'pagada').length;
    },
    getPendingInvoicesCount() {
      return this.invoicesList.filter(invoice => invoice.status === 'emitida').length;
    }
  }
};
</script>