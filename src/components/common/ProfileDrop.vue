<template>
  <div class="relative inline-block text-right p-[50px]">
    <div 
      class="flex items-center space-x-2 cursor-pointer"
      @mouseover="isDropdownOpen = true" 
      @mouseleave="isDropdownOpen = false"
    >
      <img 
        src="https://via.placeholder.com/40" 
        alt="User Avatar"
        class="h-10 w-10 rounded-full"
      />
      <span class="text-black font-medium">Bonnie Green</span>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        class="h-5 w-5 text-gray-400" 
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </div>

    <!-- Dropdown Menu -->
    <div 
      v-if="isDropdownOpen" 
      class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10" 
      @mouseleave="isDropdownOpen = false"
    >
      <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
      <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
      <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</a>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const isDropdownOpen = ref(false);
</script>
