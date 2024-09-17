<template>
    <div v-if="visible" id="toast-success" class="flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow text-white-400 bg-green-800" role="alert">
      <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg bg-green-800 dark:text-green-200">
        <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
        </svg>
        <span class="sr-only">Check icon</span>
      </div>
      <div class="ms-3 text-white text-sm font-normal">Item moved successfully.</div>
      <button @click="closeToast" type="button" class="ms-auto -mx-1.5 -my-1.5 text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 inline-flex items-center justify-center h-8 w-8" aria-label="Close">
        <span class="sr-only">Close</span>
        <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
        </svg>
      </button>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  // Reactive variable to control toast visibility
  const visible = ref(true);

  const props = defineProps({
    text:{
        type: String,
        default: 'Item Action successfully.',
        required: true
    }
  })
  
  // Function to close the toast
  const closeToast = () => {
    visible.value = false;
  };
  </script>
  
  <style  scoped>
  #toast-success {
    animation: slideIn 0.5s forwards, slideOut 0.5s forwards 2.5s;
    position: absolute;
    top: 20px;
  }
  
  </style>
  