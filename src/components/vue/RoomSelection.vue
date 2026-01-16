<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="container mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button @click="goBack" class="text-gray-600 hover:text-gray-900">
              <i class="fas fa-arrow-left text-xl"></i>
            </button>
            <h1 class="text-2xl font-bold text-gray-900">Available Rooms</h1>
          </div>
          <div class="text-sm text-gray-600">
            {{ searchCriteria?.checkIn }} - {{ searchCriteria?.checkOut }} • 
            {{ searchCriteria?.adults }} Adult(s), {{ searchCriteria?.children }} Children
          </div>
        </div>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="container mx-auto px-6 py-12 text-center">
      <i class="fas fa-spinner fa-spin text-4xl text-purple-600 mb-4"></i>
      <p class="text-xl text-gray-600">Finding the perfect rooms for you...</p>
    </div>

    <!-- Room Grid -->
    <div v-else class="container mx-auto px-6 py-8">
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div 
          v-for="room in availableRooms" 
          :key="room.id"
          class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
          <!-- Room Image -->
          <div class="h-48 bg-gradient-to-br from-purple-400 to-purple-600 relative">
            <div class="absolute inset-0 flex items-center justify-center">
              <i class="fas fa-bed text-white text-4xl"></i>
            </div>
            <div class="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full text-sm font-semibold text-purple-700">
              Room {{ room.room_number || room.roomNumber }}
            </div>
          </div>
          
          <!-- Room Details -->
          <div class="p-6">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="text-xl font-bold text-gray-900 capitalize mb-2">
                  {{ room.type }} Room
                </h3>
                <p class="text-gray-600">
                  <i class="fas fa-users mr-2"></i>
                  Up to {{ room.capacity }} guests
                </p>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-purple-600">
                  COP {{ Number(room.price_per_night || room.pricePerNight).toLocaleString() }}
                </div>
                <div class="text-sm text-gray-500">per night</div>
              </div>
            </div>
            
            <!-- Amenities -->
            <div class="mb-6">
              <h4 class="font-semibold text-gray-700 mb-2">Amenities:</h4>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="amenity in getAmenities(room)" 
                  :key="amenity"
                  class="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                >
                  {{ amenity }}
                </span>
              </div>
            </div>
            
            <!-- Book Button -->
            <button 
              @click="selectRoom(room)"
              :disabled="bookingInProgress"
              class="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-md transition-colors duration-300"
            >
              <span v-if="!bookingInProgress">Select This Room</span>
              <span v-else>
                <i class="fas fa-spinner fa-spin mr-2"></i>
                Processing...
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- No Rooms Available -->
      <div v-if="!loading && availableRooms.length === 0" class="text-center py-12">
        <i class="fas fa-bed text-6xl text-gray-300 mb-4"></i>
        <h3 class="text-2xl font-bold text-gray-700 mb-2">No rooms available</h3>
        <p class="text-gray-600 mb-6">Sorry, no rooms are available for your selected dates.</p>
        <button 
          @click="goBack"
          class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md font-semibold"
        >
          Try Different Dates
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

interface Room {
  id: number;
  room_number?: string;
  roomNumber?: string;
  type: string;
  price_per_night?: number;
  pricePerNight?: number;
  capacity: number;
  amenities?: string[] | string;
  is_available?: boolean;
  isAvailable?: boolean;
}

interface SearchCriteria {
  name: string;
  checkIn: string;
  checkOut: string;
  adults: string;
  children: string;
}

// Component state
const availableRooms = ref<Room[]>([]);
const loading = ref(true);
const bookingInProgress = ref(false);
const searchCriteria = ref<SearchCriteria | null>(null);

// Computed properties
const totalNights = computed(() => {
  if (!searchCriteria.value) return 1;
  const checkIn = new Date(searchCriteria.value.checkIn);
  const checkOut = new Date(searchCriteria.value.checkOut);
  return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
});

// Methods
const loadSearchCriteria = () => {
  const stored = localStorage.getItem('bookingSearch');
  if (stored) {
    searchCriteria.value = JSON.parse(stored);
  }
};

const loadAvailableRooms = async () => {
  try {
    loading.value = true;
    
    if (!searchCriteria.value) {
      // If no search criteria, show only available rooms
      const response = await fetch('http://localhost:4000/api/hotel/rooms');
      if (response.ok) {
        const data = await response.json();
        // Filter only available rooms
        availableRooms.value = (data.rooms || data || [])
          .filter((room: any) => {
            const status = (room.current_status || '').trim().toLowerCase();
            return status === 'available';
          })
          .map(room => ({
            ...room,
            price_per_night: (room.price_per_night || 0) * 1000
          }));
        console.log('Loaded available rooms:', availableRooms.value);
      }
    } else {
      // Search for available rooms
      const params = new URLSearchParams({
        checkIn: searchCriteria.value.checkIn,
        checkOut: searchCriteria.value.checkOut
      });
      
      const response = await fetch(`http://localhost:4000/api/hotel/rooms/available?${params}`);
      if (response.ok) {
        const data = await response.json();
        // Filter only available rooms
        availableRooms.value = (data.availableRooms || [])
          .filter((room: any) => {
            const status = (room.current_status || '').trim().toLowerCase();
            return status === 'available';
          })
          .map(room => ({
            ...room,
            price_per_night: (room.price_per_night || 0) * 1000
          }));
      }
    }
  } catch (error) {
    console.error('Error loading rooms:', error);
    // Show sample rooms if API fails
    availableRooms.value = getSampleRooms();
  } finally {
    loading.value = false;
  }
};

const getSampleRooms = (): Room[] => {
  return [
    {
      id: 1,
      room_number: '101',
      type: 'single',
      price_per_night: 80000,
      capacity: 1,
      amenities: ['WiFi', 'TV', 'AC'],
      is_available: true
    },
    {
      id: 2,
      room_number: '102',
      type: 'double',
      price_per_night: 120000,
      capacity: 2,
      amenities: ['WiFi', 'TV', 'AC', 'Minibar'],
      is_available: true
    },
    {
      id: 3,
      room_number: '201',
      type: 'suite',
      price_per_night: 200000,
      capacity: 4,
      amenities: ['WiFi', 'TV', 'AC', 'Minibar', 'Jacuzzi'],
      is_available: true
    }
  ];
};

const getAmenities = (room: Room): string[] => {
  if (Array.isArray(room.amenities)) {
    return room.amenities;
  }
  if (typeof room.amenities === 'string') {
    try {
      return JSON.parse(room.amenities);
    } catch {
      return [room.amenities];
    }
  }
  return ['WiFi', 'TV', 'AC'];
};

const selectRoom = async (room: Room) => {
  bookingInProgress.value = true;
  
  try {
    if (!searchCriteria.value) {
      alert('Please go back and enter your booking details.');
      return;
    }

    const bookingData = {
      ...searchCriteria.value,
      roomId: room.id,
      roomNumber: room.room_number || room.roomNumber,
      roomType: room.type,
      pricePerNight: room.price_per_night || room.pricePerNight,
      totalAmount: (room.price_per_night || room.pricePerNight || 100) * totalNights.value
    };

    // Store booking details
    localStorage.setItem('selectedRoom', JSON.stringify(bookingData));

    // Redirect to confirmation/payment page
    alert(`Room ${room.room_number || room.roomNumber} selected! Total: $${bookingData.totalAmount} for ${totalNights.value} nights.`);
    
    // For now, redirect to dashboard - in a real app this would be a checkout page
    window.location.href = '/admin/dashboard';
    
  } catch (error) {
    console.error('Error selecting room:', error);
    alert('Error selecting room. Please try again.');
  } finally {
    bookingInProgress.value = false;
  }
};

const goBack = () => {
  window.location.href = '/';
};

// Lifecycle
onMounted(() => {
  loadSearchCriteria();
  loadAvailableRooms();
});
</script>