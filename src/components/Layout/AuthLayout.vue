<template>
    <div class="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <!-- Add a slot for custom logos, titles, etc. -->
        <slot name="header"></slot>
      </div>
      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <!-- Slot for forms (like LoginForm.vue) -->
          <slot></slot>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  // No additional setup needed here for now
  </script>
  